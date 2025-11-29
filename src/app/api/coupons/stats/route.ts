// app/api/coupons/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get coupon statistics
export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    // Get all counts in parallel
    const [
      totalCoupons,
      activeCoupons,
      inactiveCoupons,
      expiredCoupons,
      upcomingCoupons,
      giftCards,
      regularCoupons,
      totalUsage,
      mostUsedCoupon,
      totalDiscountGiven,
    ] = await Promise.all([
      // Total coupons
      prisma.coupons.count(),

      // Active coupons (is_active = true and not expired)
      prisma.coupons.count({
        where: {
          is_active: true,
          OR: [
            { expiry_date: { gte: now } },
            { expiry_date: null },
          ],
          AND: [
            {
              OR: [
                { start_date: { lte: now } },
                { start_date: null },
              ],
            },
          ],
        },
      }),

      // Inactive coupons (is_active = false)
      prisma.coupons.count({
        where: { is_active: false },
      }),

      // Expired coupons
      prisma.coupons.count({
        where: { expiry_date: { lt: now } },
      }),

      // Upcoming coupons (start_date in future)
      prisma.coupons.count({
        where: { start_date: { gt: now } },
      }),

      // Gift cards
      prisma.coupons.count({
        where: { type: 'giftcard' },
      }),

      // Regular coupons
      prisma.coupons.count({
        where: { type: 'coupon' },
      }),

      // Total usage count
      prisma.coupon_user_usages.count(),

      // Most used coupon
      prisma.coupons.findFirst({
        include: {
          coupon_user_usages: {
            select: { id: true },
          },
        },
        orderBy: {
          coupon_user_usages: {
            _count: 'desc',
          },
        },
      }),

      // Total discount given
      prisma.coupon_user_usages.aggregate({
        _sum: {
          amt: true,
        },
      }),
    ]);

    // Calculate percentage-based discount types
    const [percentageDiscounts, fixedDiscounts] = await Promise.all([
      prisma.coupons.count({
        where: { discount_type: 'percentage' },
      }),
      prisma.coupons.count({
        where: { discount_type: 'fixed' },
      }),
    ]);

    // Get recent coupons (last 7 days)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCoupons = await prisma.coupons.count({
      where: {
        created_at: { gte: sevenDaysAgo },
      },
    });

    // Get usage by type
    const usageByType = await prisma.coupon_user_usages.groupBy({
      by: ['type'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: totalCoupons,
          active: activeCoupons,
          inactive: inactiveCoupons,
          expired: expiredCoupons,
          upcoming: upcomingCoupons,
        },
        byType: {
          giftcards: giftCards,
          coupons: regularCoupons,
        },
        byDiscountType: {
          percentage: percentageDiscounts,
          fixed: fixedDiscounts,
        },
        usage: {
          total: totalUsage,
          totalDiscountGiven: totalDiscountGiven._sum.amt || 0,
          usageByType: usageByType.reduce((acc, item) => {
            acc[item.type || 'unknown'] = item._count;
            return acc;
          }, {} as Record<string, number>),
        },
        recent: {
          last7Days: recentCoupons,
        },
        mostUsed: mostUsedCoupon
          ? {
              id: mostUsedCoupon.id.toString(),
              code: mostUsedCoupon.code,
              usage_count: mostUsedCoupon.coupon_user_usages.length,
              description: mostUsedCoupon.description,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching coupon stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch coupon stats' },
      { status: 500 }
    );
  }
}