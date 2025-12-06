import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ userId: string }>;
};

async function getUserId(context: RouteContext): Promise<bigint> {
  const { userId } = await context.params; // unwrap params Promise

  const trimmed = userId?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid userId: "${userId}"`);
  }

  return BigInt(trimmed);
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId(context); // ✅ unwrap params, get bigint

    const [tickets, ticketReviews, appReviews] = await Promise.all([
      // Support tickets with category details
      prisma.tickets.findMany({
        where: { userId, isDelete: false },
        include: {
          help_support: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),

      // Ticket reviews given by user
      prisma.ticketreview.findMany({
        where: { userId: Number(userId) },
        include: {
          ticket: {
            select: {
              ticketNumber: true,
              subject: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),

      // App reviews
      prisma.app_reviews.findMany({
        where: { userId, isDelete: false },
        orderBy: { created_at: "desc" },
      }),
    ]);

    // Group tickets by status
    const ticketsByStatus = tickets.reduce(
      (acc, ticket) => {
        const status = ticket.ticketStatus || "unknown";
        if (!acc[status]) acc[status] = [];
        acc[status].push(ticket);
        return acc;
      },
      {} as Record<string, typeof tickets>
    );

    // Calculate average response time (if tickets have resolution)
    const resolvedTickets = tickets.filter(
      (t) => t.ticketStatus === "resolved" && t.created_at && t.updated_at
    );
    const avgResponseTime =
      resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum, t) => {
            const created = new Date(t.created_at!).getTime();
            const updated = new Date(t.updated_at!).getTime();
            return sum + (updated - created);
          }, 0) / resolvedTickets.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        tickets: {
          total: tickets.length,
          byStatus: Object.keys(ticketsByStatus).map((status) => ({
            status,
            count: ticketsByStatus[status].length,
          })),
          recent: tickets.slice(0, 10).map((t) => ({
            id: t.id.toString(),
            ticketNumber: t.ticketNumber,
            subject: t.subject,
            description: t.description,
            status: t.ticketStatus,
            category: t.help_support?.name,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          })),
          averageResponseTimeHours:
            avgResponseTime > 0 ? avgResponseTime / (1000 * 60 * 60) : null,
        },
        ticketReviews: {
          total: ticketReviews.length,
          averageRating:
            ticketReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            (ticketReviews.length || 1),
          recent: ticketReviews.map((r) => ({
            id: r.id.toString(), // ✅ safer if id is BigInt
            ticketNumber: r.ticket.ticketNumber,
            subject: r.ticket.subject,
            rating: r.rating,
            review: r.review,
            createdAt: r.created_at,
          })),
        },
        appReviews: {
          total: appReviews.length,
          recent: appReviews.map((r) => ({
            id: r.id.toString(),
            review: r.review,
            createdAt: r.created_at,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user support data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user support data" },
      { status: 500 }
    );
  }
}
