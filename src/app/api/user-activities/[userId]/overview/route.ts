// app/api/user-activities/[userId]/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ userId: string }>;
};

async function getUserId(context: RouteContext): Promise<bigint> {
  const { userId } = await context.params; // unwrap the Promise

  const trimmed = userId?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid userId: "${userId}"`);
  }

  return BigInt(trimmed);
}


export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId(context);   
    const userIdNumber = Number(userId);         


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
      // Basic user info (id is BigInt in DB)
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

      // Chat statistics (userId is BigInt)
      prisma.chatrequest.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          deduction: true,
        },
      }),

      // Call statistics (userId is BigInt)
      prisma.callrequest.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          deduction: true,
        },
      }),


      prisma.order_request.aggregate({
        where: { userId: userIdNumber },
        _count: { id: true },
        _sum: {
          totalPayable: true,
        },
      }),


      prisma.wallettransaction.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          amount: true,
        },
      }),


      prisma.user_reviews.aggregate({
        where: { userId },
        _count: { id: true },
        _avg: {
          rating: true,
        },
      }),


      prisma.astrologer_followers.count({
        where: { userId },
      }),


      prisma.tickets.groupBy({
        by: ["ticketStatus"],
        where: { userId },
        _count: { id: true },
      }),


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


      prisma.horoscopefeedback.count({
        where: { userId: userIdNumber },
      }),


      prisma.story_view_counts.count({
        where: { userId: userIdNumber },
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