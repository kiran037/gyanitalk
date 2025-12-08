import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

// 👇 ADD THIS HELPER
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

  // objects: recurse
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

    // Ticket Overview
    const [
      currentTickets,
      previousTickets,
      openTickets,
      closedTickets,
      ticketsByStatus,
    ] = await Promise.all([
      // Current period tickets
      prisma.tickets.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
      }),

      // Previous period tickets
      prisma.tickets.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          isDelete: false,
        },
      }),

      // Open tickets
      prisma.tickets.count({
        where: {
          ticketStatus: "open",
          isDelete: false,
        },
      }),

      // Closed tickets in current period
      prisma.tickets.count({
        where: {
          ticketStatus: "closed",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
      }),

      // Tickets by status
      prisma.tickets.groupBy({
        by: ["ticketStatus"],
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
        _count: true,
      }),
    ]);

    const ticketsComparison = calculateComparison(currentTickets, previousTickets);

    // Tickets by Category (Help Support)
    const ticketsByCategory = await prisma.tickets.groupBy({
      by: ["helpSupportId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
      },
      _count: true,
      orderBy: { _count: { helpSupportId: "desc" } },
    });

    const categoryIds = ticketsByCategory.map((t) => t.helpSupportId);
    const categoryDetails = await prisma.help_supports.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const ticketsByCategoryWithDetails = ticketsByCategory.map((ticket) => {
      const details = categoryDetails.find((c) => c.id === ticket.helpSupportId);
      return {
        categoryId: ticket.helpSupportId,
        categoryName: details?.name || "Unknown",
        count: ticket._count,
      };
    });

    // Average Resolution Time
    const resolvedTickets = await prisma.$queryRaw<
      Array<{ avgResolutionTime: number }>
    >`
      SELECT 
        AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avgResolutionTime
      FROM tickets
      WHERE ticketStatus = 'closed'
        AND created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
        AND isDelete = false
        AND updated_at IS NOT NULL
    `;

    const avgResolutionTime = resolvedTickets[0]?.avgResolutionTime || 0;

    // Daily Ticket Trend
    const dailyTicketTrend = await prisma.$queryRaw<
      Array<{ date: Date; created: number; resolved: number }>
    >`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as created,
        SUM(CASE WHEN ticketStatus = 'closed' THEN 1 ELSE 0 END) as resolved
      FROM tickets
      WHERE created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
        AND isDelete = false
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Ticket Reviews & Ratings
    const ticketReviews = await prisma.ticketreview.aggregate({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _avg: { rating: true },
      _count: true,
    });

    const ratingDistribution = await prisma.ticketreview.groupBy({
      by: ["rating"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _count: true,
    });

    // User Reviews Analytics
    const [
      totalReviews,
      previousReviews,
      avgRating,
      blockedReviews,
      reportedReviews,
    ] = await Promise.all([
      // Current reviews
      prisma.user_reviews.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
      }),

      // Previous reviews
      prisma.user_reviews.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          isDelete: false,
        },
      }),

      // Average rating
      prisma.user_reviews.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
        _avg: { rating: true },
      }),

      // Blocked reviews
      prisma.blockuserreview.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isBlocked: 1,
        },
      }),

      // Reported reviews
      prisma.blockuserreview.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isReported: 1,
        },
      }),
    ]);

    const reviewsComparison = calculateComparison(totalReviews, previousReviews);

    // Review Rating Distribution
    const reviewRatingDistribution = await prisma.user_reviews.groupBy({
      by: ["rating"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
      },
      _count: true,
      orderBy: { rating: "desc" },
    });

    // Top Reviewed Astrologers
    const topReviewedAstrologers = await prisma.user_reviews.groupBy({
      by: ["astrologerId"],
      where: {
        astrologerId: { not: null },
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
      },
      _count: true,
      _avg: { rating: true },
      orderBy: { _count: { astrologerId: "desc" } },
      take: 10,
    });

    const astrologerIds = topReviewedAstrologers
      .map((r) => r.astrologerId)
      .filter(Boolean) as bigint[];
    const astrologerDetails = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: { id: true, name: true, profileImage: true },
    });

    const topReviewedWithDetails = topReviewedAstrologers.map((review) => {
      const details = astrologerDetails.find((a) => a.id === review.astrologerId);
      return {
        astrologerId: review.astrologerId,
        name: details?.name || "Unknown",
        profileImage: details?.profileImage,
        reviewCount: review._count,
        avgRating: Number(review._avg.rating || 0),
      };
    });

    // Sentiment Analysis (Based on rating)
    const sentimentAnalysis = {
      positive: reviewRatingDistribution
        .filter((r) => r.rating >= 4)
        .reduce((sum, r) => sum + r._count, 0),
      neutral: reviewRatingDistribution
        .filter((r) => r.rating === 3)
        .reduce((sum, r) => sum + r._count, 0),
      negative: reviewRatingDistribution
        .filter((r) => r.rating < 3)
        .reduce((sum, r) => sum + r._count, 0),
    };

    // Customer Satisfaction Score (CSAT)
    const csat =
      totalReviews > 0
        ? (reviewRatingDistribution
            .filter((r) => r.rating >= 4)
            .reduce((sum, r) => sum + r._count, 0) /
            totalReviews) *
          100
        : 0;

    // Net Promoter Score (NPS) - simplified (5 stars = promoters, 1-3 = detractors)
    const promoters = reviewRatingDistribution
      .filter((r) => r.rating === 5)
      .reduce((sum, r) => sum + r._count, 0);
    const detractors = reviewRatingDistribution
      .filter((r) => r.rating <= 3)
      .reduce((sum, r) => sum + r._count, 0);
    const nps = totalReviews > 0 ? ((promoters - detractors) / totalReviews) * 100 : 0;

    const response: DashboardResponse = {
      success: true,
      data: {
        tickets: {
          summary: {
            total: currentTickets,
            comparison: ticketsComparison,
            open: openTickets,
            closed: closedTickets,
            resolutionRate: currentTickets > 0 ? (closedTickets / currentTickets) * 100 : 0,
            avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
          },
          byStatus: ticketsByStatus.map((s) => ({
            status: s.ticketStatus || "Unknown",
            count: s._count,
          })),
          byCategory: ticketsByCategoryWithDetails,
          charts: {
            dailyTrend: dailyTicketTrend.map((d) => ({
              date: d.date,
              created: Number(d.created),
              resolved: Number(d.resolved),
            })),
          },
        },
        ticketReviews: {
          averageRating: Number(ticketReviews._avg.rating || 0),
          totalReviews: ticketReviews._count,
          distribution: ratingDistribution.map((r) => ({
            rating: r.rating,
            count: r._count,
          })),
        },
        userReviews: {
          summary: {
            total: totalReviews,
            comparison: reviewsComparison,
            avgRating: Number(avgRating._avg.rating || 0),
            blocked: blockedReviews,
            reported: reportedReviews,
          },
          distribution: reviewRatingDistribution.map((r) => ({
            rating: r.rating,
            count: r._count,
            percentage: totalReviews > 0 ? (r._count / totalReviews) * 100 : 0,
          })),
          topReviewed: topReviewedWithDetails,
          sentiment: sentimentAnalysis,
        },
        satisfaction: {
          csat: Math.round(csat * 10) / 10,
          nps: Math.round(nps * 10) / 10,
        },
      },
      metadata: {
        filter,
        dateRange,
        generatedAt: new Date().toISOString(),
        comparison: { previousRange },
      },
    };

    return NextResponse.json(convertPrismaTypes(response));
  } catch (error) {
    console.error("Support dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch support analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}