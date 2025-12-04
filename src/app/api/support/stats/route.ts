// app/api/support/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET overall support statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Contact Us Stats
    const contactStats = await prisma.contact_us.count({
      where: startDate || endDate ? { created_at: dateFilter } : {},
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

    // Ticket Stats
    const ticketStats = {
      total: await prisma.tickets.count({
        where: {
          isDelete: false,
          ...(startDate || endDate ? { created_at: dateFilter } : {}),
        },
      }),
      open: await prisma.tickets.count({
        where: {
          isDelete: false,
          ticketStatus: "Open",
          ...(startDate || endDate ? { created_at: dateFilter } : {}),
        },
      }),
      inProgress: await prisma.tickets.count({
        where: {
          isDelete: false,
          ticketStatus: "In Progress",
          ...(startDate || endDate ? { created_at: dateFilter } : {}),
        },
      }),
      resolved: await prisma.tickets.count({
        where: {
          isDelete: false,
          ticketStatus: "Resolved",
          ...(startDate || endDate ? { created_at: dateFilter } : {}),
        },
      }),
      closed: await prisma.tickets.count({
        where: {
          isDelete: false,
          ticketStatus: "Closed",
          ...(startDate || endDate ? { created_at: dateFilter } : {}),
        },
      }),
    };

    // Recent Tickets
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
            name: true,
            email: true,
          },
        },
      },
    });

    // Ticket Reviews Stats
    const reviewStats = await prisma.ticketreview.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    // FAQ Stats
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

    // Ticket by Category
    const ticketsByCategory = await prisma.tickets.groupBy({
      by: ["helpSupportId"],
      where: {
        isDelete: false,
        ...(startDate || endDate ? { created_at: dateFilter } : {}),
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

    // Get category names
    const categoryIds = ticketsByCategory.map((t) => t.helpSupportId);
    const categories = await prisma.help_supports.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const ticketsByCategoryWithNames = ticketsByCategory.map((t) => {
      const category = categories.find((c) => c.id === t.helpSupportId);
      return {
        categoryId: t.helpSupportId.toString(),
        categoryName: category?.name || "Unknown",
        count: t._count.id,
      };
    });

    // Serialize BigInt in recent tickets
    const serializedRecentTickets = recentTickets.map((t) => ({
      ...t,
      id: t.id.toString(),
      user: t.user ? {
        ...t.user,
        id: t.user.id?.toString(),
      } : null,
    }));

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