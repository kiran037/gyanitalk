// app/api/user-activities/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause: any = {
      isDelete: false,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactNo: { contains: search } },
      ];
    }

    // Get total count
    const totalUsers = await prisma.users.count({ where: whereClause });

    // Get users with basic info
    const users = await prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        profile: true,
        created_at: true,
        isActive: true,
        birthDate: true,
        gender: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    // Get activity stats for these users
    const userIds = users.map((u) => u.id);

    const [chatCounts, callCounts, orderCounts, walletBalances] =
      await Promise.all([
        // Chat counts
        prisma.chatrequest.groupBy({
          by: ["userId"],
          where: { userId: { in: userIds } },
          _count: { id: true },
        }),

        // Call counts
        prisma.callrequest.groupBy({
          by: ["userId"],
          where: { userId: { in: userIds } },
          _count: { id: true },
        }),

        // Order counts and totals
        prisma.order_request.groupBy({
          by: ["userId"],
          where: { userId: { in: userIds.map((id) => Number(id)) } },
          _count: { id: true },
          _sum: { totalPayable: true },
        }),

        // Current wallet balances
        prisma.user_wallets.findMany({
          where: { userId: { in: userIds } },
          select: { userId: true, amount: true },
        }),
      ]);

    // Create lookup maps
    const chatMap = new Map(chatCounts.map((c) => [c.userId.toString(), c._count.id]));
    const callMap = new Map(callCounts.map((c) => [c.userId.toString(), c._count.id]));
    const orderMap = new Map(
      orderCounts.map((o) => [
        BigInt(o.userId).toString(),
        { count: o._count.id, total: o._sum.totalPayable || 0 },
      ])
    );
    const walletMap = new Map(
      walletBalances.map((w) => [w.userId.toString(), w.amount])
    );

    // Combine data
    const usersWithStats = users.map((user) => {
      const userId = user.id.toString();
      return {
        id: userId,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        profile: user.profile,
        gender: user.gender,
        joinedAt: user.created_at,
        isActive: user.isActive,
        stats: {
          totalChats: chatMap.get(userId) || 0,
          totalCalls: callMap.get(userId) || 0,
          totalOrders: orderMap.get(userId)?.count || 0,
          totalSpent: orderMap.get(userId)?.total || 0,
          walletBalance: walletMap.get(userId) || 0,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user activity list:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity list" },
      { status: 500 }
    );
  }
}