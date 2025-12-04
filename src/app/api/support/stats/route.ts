// app/api/support/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET overall support statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter for created_at
    const createdAtFilter: Record<string, Date> = {};
    if (startDate) createdAtFilter.gte = new Date(startDate);
    if (endDate) createdAtFilter.lte = new Date(endDate);

    const withDateFilter =
      startDate || endDate ? { created_at: createdAtFilter } : {};

    // -----------------------
    // Contact Us Stats
    // -----------------------
    const contactStats = await prisma.contact_us.count({
      where: withDateFilter,
    });

    const recentContacts = await prisma.contact_us.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        contact_name: true,
        contact_email: true,
        created_at: true,
      },
    });

    // -----------------------
    // Ticket Stats
    // -----------------------
    const ticketStats = {
      total: await prisma.tickets.count({
        where: {
          isDelete: false,
          ...withDateFilter,
        },
      }),
      open: await prisma.tickets.count({
        where: {
          isDelete: false,
          ticketStatus: "Open",
          ...withDateFilter,
        },
      }),
      inProgress: await prisma.tickets.count({
        where: {
          isDelete: false,
          ticketStatus: "In Progress",
          ...withDateFilter,
        },
      }),
      resolved: await prisma.tickets.count({
        where: {
          isDelete: false,
          ticketStatus: "Resolved",
          ...withDateFilter,
        },
      }),
      closed: await prisma.tickets.count({
        where: {
          isDelete: false,
          ticketStatus: "Closed",
          ...withDateFilter,
        },
      }),
    };

    // -----------------------
    // Recent Tickets
    // -----------------------
    const recentTickets = await prisma.tickets.findMany({
      where: { isDelete: false },
      take: 5,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        ticketStatus: true,
        created_at: true,
        user: {
          select: {
            id: true,          // 👈 add id so we can serialize it
            name: true,
            email: true,
          },
        },
      },
    });

    const serializedRecentTickets = recentTickets.map((t) => ({
      ...t,
      id: t.id.toString(), // BigInt -> string
      user: t.user
        ? {
            ...t.user,
            id: t.user.id.toString(), // BigInt -> string
          }
        : null,
    }));

    // -----------------------
    // Ticket Reviews Stats
    // -----------------------
    const reviewStats = await prisma.ticketreview.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    // -----------------------
    // FAQ Stats
    // -----------------------
    const faqStats = {
      categories: await prisma.help_supports.count({
        where: { isDelete: false },
      }),
      questions: await prisma.help_support_quations.count({
        where: { isDelete: false },
      }),
      answers: await prisma.help_support_quation_answers.count({
        where: { isDelete: false },
      }),
      activeCategories: await prisma.help_supports.count({
        where: { isDelete: false, isActive: true },
      }),
      activeQuestions: await prisma.help_support_quations.count({
        where: { isDelete: false, isActive: true },
      }),
    };

    // -----------------------
    // Tickets by Category
    // -----------------------
    const ticketsByCategory = await prisma.tickets.groupBy({
      by: ["helpSupportId"],
      where: {
        isDelete: false,
        ...withDateFilter,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const categoryIds = ticketsByCategory.map((t) => t.helpSupportId);
    const categories = await prisma.help_supports.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const ticketsByCategoryWithNames = ticketsByCategory.map((t) => {
      const category = categories.find((c) => c.id === t.helpSupportId);
      return {
        categoryId: t.helpSupportId.toString(), // BigInt -> string
        categoryName: category?.name || "Unknown",
        count: t._count.id,
      };
    });

    // -----------------------
    // Final response
    // -----------------------
    return NextResponse.json({
      success: true,
      data: {
        contacts: {
          total: contactStats,
          recent: recentContacts,
        },
        tickets: {
          stats: ticketStats,
          recent: serializedRecentTickets,
          byCategory: ticketsByCategoryWithNames,
        },
        reviews: {
          averageRating: reviewStats._avg.rating || 0,
          totalReviews: reviewStats._count.rating || 0,
        },
        faq: faqStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
