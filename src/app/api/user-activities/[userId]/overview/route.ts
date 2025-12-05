// app/api/user-activities/[userId]/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = BigInt(params.userId);

    // Run all queries in parallel for performance
    const [
      user,
      chatStats,
      callStats,
      orderStats,
      walletStats,
      reviewStats,
      followStats,
      ticketStats,
      deviceInfo,
      horoscopeFeedback,
      storyViews,
    ] = await Promise.all([
      // Basic user info
      prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
          created_at: true,
          isActive: true,
        },
      }),

      // Chat statistics
      prisma.chatrequest.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          deduction: true,
        },
      }),

      // Call statistics  
      prisma.callrequest.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          deduction: true,
        },
      }),

      // Order statistics
      prisma.order_request.aggregate({
        where: { userId: Number(userId) },
        _count: { id: true },
        _sum: {
          totalPayable: true,
        },
      }),

      // Wallet statistics
      prisma.wallettransaction.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          amount: true,
        },
      }),

      // Review statistics
      prisma.user_reviews.aggregate({
        where: { userId },
        _count: { id: true },
        _avg: {
          rating: true,
        },
      }),

      // Follow statistics
      prisma.astrologer_followers.count({
        where: { userId },
      }),

      // Ticket statistics
      prisma.tickets.groupBy({
        by: ["ticketStatus"],
        where: { userId },
        _count: { id: true },
      }),

      // Latest device info
      prisma.user_device_details.findFirst({
        where: { userId },
        orderBy: { updated_at: "desc" },
        select: {
          deviceModel: true,
          deviceManufacturer: true,
          appVersion: true,
          updated_at: true,
        },
      }),

      // Horoscope feedback count
      prisma.horoscopefeedback.count({
        where: { userId: Number(userId) },
      }),

      // Story views count
      prisma.story_view_counts.count({
        where: { userId: Number(userId) },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Format ticket stats
    const ticketSummary = {
      total: ticketStats.reduce((sum, t) => sum + t._count.id, 0),
      byStatus: ticketStats.reduce((acc, t) => {
        acc[t.ticketStatus || "unknown"] = t._count.id;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          profile: user.profile,
          joinedAt: user.created_at,
          isActive: user.isActive,
        },
        engagement: {
          chats: {
            total: chatStats._count.id,
            totalSpent: chatStats._sum.deduction || 0,
          },
          calls: {
            total: callStats._count.id,
            totalSpent: callStats._sum.deduction || 0,
          },
          orders: {
            total: orderStats._count.id,
            totalSpent: orderStats._sum.totalPayable || 0,
          },
          reviews: {
            total: reviewStats._count.id,
            averageRating: reviewStats._avg.rating || 0,
          },
          following: {
            astrologers: followStats,
          },
        },
        wallet: {
          totalTransactions: walletStats._count.id,
          totalAmount: walletStats._sum.amount || 0,
        },
        support: ticketSummary,
        content: {
          horoscopeFeedback: horoscopeFeedback,
          storyViews: storyViews,
        },
        device: deviceInfo,
      },
    });
  } catch (error) {
    console.error("Error fetching user activity overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity overview" },
      { status: 500 }
    );
  }
}