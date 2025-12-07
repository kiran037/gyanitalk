import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

// 🔹 Add this helper once here (or import from a shared util)
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // BigInt → string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal → number
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  // Date → ISO string
  if (obj instanceof Date) return obj.toISOString();

  // primitives
  if (typeof obj !== "object") return obj;

  // arrays
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  // plain objects
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = getDateRange(filter, customStart || undefined, customEnd || undefined);
    const previousRange = getPreviousDateRange(dateRange);

    // Coupon Analytics
    const [
      totalCoupons,
      activeCoupons,
      couponUsages,
      previousCouponUsages,
      couponRevenue,
    ] = await Promise.all([
      // Total coupons
      prisma.coupons.count(),

      // Active coupons
      prisma.coupons.count({
        where: { is_active: true },
      }),

      // Current period coupon usages
      prisma.coupon_user_usages.count({
        where: {
          used_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Previous period coupon usages
      prisma.coupon_user_usages.count({
        where: {
          used_at: { gte: previousRange.startDate, lte: previousRange.endDate },
        },
      }),

      // Revenue generated with coupons
      prisma.coupon_user_usages.aggregate({
        where: {
          used_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
        _sum: { amt: true },
      }),
    ]);

    const couponUsageComparison = calculateComparison(couponUsages, previousCouponUsages);

    // Top Performing Coupons
    const topCoupons = await prisma.coupon_user_usages.groupBy({
      by: ["coupon_id"],
      where: {
        used_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _count: true,
      _sum: { amt: true },
      orderBy: { _count: { coupon_id: "desc" } },
      take: 10,
    });

    const couponIds = topCoupons.map((c) => c.coupon_id);
    const couponDetails = await prisma.coupons.findMany({
      where: { id: { in: couponIds } },
      select: {
        id: true,
        code: true,
        discount_type: true,
        discount_value: true,
        type: true,
      },
    });

    const topCouponsWithDetails = topCoupons.map((coupon) => {
      const details = couponDetails.find((d) => d.id === coupon.coupon_id);
      return {
        id: coupon.coupon_id,
        code: details?.code || "Unknown",
        discountType: details?.discount_type,
        discountValue: Number(details?.discount_value || 0),
        type: details?.type,
        usageCount: coupon._count,
        totalDiscount: Number(coupon._sum.amt || 0),
      };
    });

    // Coupon ROI (Revenue generated vs discount given)
    const ordersWithCoupons = await prisma.order_request.findMany({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        couponCode: { not: null },
        orderStatus: { not: "cancelled" },
      },
      select: {
        totalPayable: true,
        coupon_user_usages: {
          select: { amt: true },
        },
      },
    });

    const totalRevenueWithCoupons = ordersWithCoupons.reduce(
      (sum, order) => sum + Number(order.totalPayable || 0),
      0
    );
    const totalDiscountGiven = ordersWithCoupons.reduce(
      (sum, order) =>
        sum + order.coupon_user_usages.reduce((s, c) => s + (c.amt || 0), 0),
      0
    );

    // Referral Program Analytics
    const [
      totalReferrals,
      previousReferrals,
      referralRevenue,
      previousReferralRevenue,
    ] = await Promise.all([
      // Current period referrals
      prisma.payment.count({
        where: {
          referred_user_id: { not: null },
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Previous period referrals
      prisma.payment.count({
        where: {
          referred_user_id: { not: null },
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
        },
      }),

      // Referral revenue
      prisma.payment.aggregate({
        where: {
          referred_user_id: { not: null },
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          paymentStatus: "success",
        },
        _sum: { amount: true, cashback_amount: true },
      }),

      // Previous referral revenue
      prisma.payment.aggregate({
        where: {
          referred_user_id: { not: null },
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          paymentStatus: "success",
        },
        _sum: { amount: true },
      }),
    ]);

    const referralsComparison = calculateComparison(totalReferrals, previousReferrals);
    const referralRevenueComparison = calculateComparison(
      Number(referralRevenue._sum.amount || 0),
      Number(previousReferralRevenue._sum.amount || 0)
    );

    // Top Referrers
    const topReferrers = await prisma.payment.groupBy({
      by: ["referred_user_id"],
      where: {
        referred_user_id: { not: null },
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _count: true,
      _sum: { amount: true, cashback_amount: true },
      orderBy: { _count: { referred_user_id: "desc" } },
      take: 10,
    });

    // App Reviews & Ratings
    const [appReviews, averageRating, ratingDistribution] = await Promise.all([
      // Total reviews
      prisma.app_reviews.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
      }),

      // Average rating from user_reviews
      prisma.user_reviews.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
        _avg: { rating: true },
      }),

      // Rating distribution
      prisma.user_reviews.groupBy({
        by: ["rating"],
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
        _count: true,
      }),
    ]);

    // Banner Performance
    const activeBanners = await prisma.banners.count({
      where: {
        isActive: true,
        isDelete: false,
        fromDate: { lte: dateRange.endDate },
        toDate: { gte: dateRange.startDate },
      },
    });

    const bannersByType = await prisma.banners.groupBy({
      by: ["bannerTypeId"],
      where: {
        isActive: true,
        isDelete: false,
        fromDate: { lte: dateRange.endDate },
        toDate: { gte: dateRange.startDate },
      },
      _count: true,
    });

    // Astrologer Followers Growth
    const [currentFollowers, previousFollowers] = await Promise.all([
      prisma.astrologer_followers.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
      }),
      prisma.astrologer_followers.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          isDelete: false,
        },
      }),
    ]);

    const followersComparison = calculateComparison(currentFollowers, previousFollowers);

    // Most Followed Astrologers
    const mostFollowed = await prisma.astrologer_followers.groupBy({
      by: ["astrologerId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
        astrologerId: { not: 0 },
      },
      _count: true,
      orderBy: { _count: { astrologerId: "desc" } },
      take: 10,
    });

    const astrologerIds = mostFollowed.map((f) => f.astrologerId);
    const astrologerDetails = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: { id: true, name: true, profileImage: true },
    });

    const mostFollowedWithDetails = mostFollowed.map((follower) => {
      const details = astrologerDetails.find((d) => d.id === follower.astrologerId);
      return {
        id: follower.astrologerId,
        name: details?.name || "Unknown",
        profileImage: details?.profileImage,
        followers: follower._count,
      };
    });

    // Gift Analytics
    const giftStats = await prisma.astrologer_gifts.aggregate({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
      },
      _count: true,
      _sum: { giftAmount: true },
    });

    const response: DashboardResponse = {
      success: true,
      data: {
        coupons: {
          summary: {
            totalCoupons,
            activeCoupons,
            usages: couponUsages,
            usageComparison: couponUsageComparison,
            totalDiscount: Number(couponRevenue._sum.amt || 0),
          },
          topPerforming: topCouponsWithDetails,
          roi: {
            revenueGenerated: totalRevenueWithCoupons,
            discountGiven: totalDiscountGiven,
            roi:
              totalDiscountGiven > 0
                ? ((totalRevenueWithCoupons - totalDiscountGiven) / totalDiscountGiven) * 100
                : 0,
          },
        },
        referrals: {
          summary: {
            totalReferrals,
            comparison: referralsComparison,
            revenue: Number(referralRevenue._sum.amount || 0),
            revenueComparison: referralRevenueComparison,
            cashbackGiven: Number(referralRevenue._sum.cashback_amount || 0),
          },
          topReferrers: topReferrers.map((r) => ({
            userId: r.referred_user_id,
            referrals: r._count,
            revenue: Number(r._sum.amount || 0),
            cashback: Number(r._sum.cashback_amount || 0),
          })),
          conversionRate:
            totalReferrals > 0
              ? (Number(referralRevenue._sum.amount || 0) / totalReferrals) * 100
              : 0,
        },
        reviews: {
          totalReviews: appReviews,
          averageRating: Number(averageRating._avg.rating || 0),
          distribution: ratingDistribution.map((r) => ({
            rating: r.rating,
            count: r._count,
          })),
        },
        banners: {
          activeBanners,
          byType: bannersByType.map((b) => ({
            typeId: b.bannerTypeId,
            count: b._count,
          })),
        },
        followers: {
          newFollowers: currentFollowers,
          comparison: followersComparison,
          mostFollowed: mostFollowedWithDetails,
        },
        gifts: {
          totalGifts: giftStats._count,
          totalAmount: Number(giftStats._sum.giftAmount || 0),
        },
      },
      metadata: {
        filter,
        dateRange,
        generatedAt: new Date().toISOString(),
        comparison: { previousRange },
      },
    };

    // 🔹 IMPORTANT: make JSON-safe
    return NextResponse.json(convertPrismaTypes(response));
  } catch (error) {
    console.error("Marketing dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch marketing analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } 
}