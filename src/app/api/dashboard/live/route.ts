import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { DashboardResponse } from "../utils/types";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Real-time metrics don't need date filtering
    const now = new Date();
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
    const last15Minutes = new Date(now.getTime() - 15 * 60 * 1000);
    const last30Minutes = new Date(now.getTime() - 30 * 60 * 1000);
    const last1Hour = new Date(now.getTime() - 60 * 60 * 1000);

    // Active Sessions
    const [
      activeChats,
      activeCalls,
      onlineAstrologers,
      onlineUsers,
      liveStreamingSessions,
      waitlistCount,
    ] = await Promise.all([
      // Active chat sessions
      prisma.chatrequest.count({
        where: {
          chatStatus: { in: ["Accepted", "InProgress", "Ongoing"] },
          updated_at: { gte: last30Minutes },
        },
      }),

      // Active call sessions
      prisma.callrequest.count({
        where: {
          callStatus: { in: ["Accepted", "InProgress", "Ongoing"] },
          updated_at: { gte: last30Minutes },
        },
      }),

      // Online astrologers
      prisma.astrologers.count({
        where: {
          isActive: true,
          isDelete: false,
          chatStatus: "online",
        },
      }),

      // Online users (active in last 5 minutes)
      prisma.liveuser.count(),

      // Live streaming sessions
      prisma.liveastro.count({
        where: {
          isActive: 1,
        },
      }),

      // Users in waitlist
      prisma.waitlist.count({
        where: {
          status: "waiting",
        },
      }),
    ]);

    // Recent Chat Activities (last 15 minutes)
    const recentChats = await prisma.chatrequest.findMany({
      where: {
        created_at: { gte: last15Minutes },
      },
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        user: { select: { id: true, name: true, profile: true } },
        astrologer: { select: { id: true, name: true, profileImage: true } },
      },
    });

    // Recent Call Activities (last 15 minutes)
    const recentCalls = await prisma.callrequest.findMany({
      where: {
        created_at: { gte: last15Minutes },
      },
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        user: { select: { id: true, name: true, profile: true } },
        astrologer: { select: { id: true, name: true, profileImage: true } },
      },
    });

    // Live Streaming Astrologers
    const liveStreamers = await prisma.liveastro.findMany({
      where: {
        isActive: 1,
      },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            primarySkill: true,
          },
        },
      },
    });

    // Current Waitlist
    const waitlist = await prisma.waitlist.findMany({
      where: {
        status: "waiting",
      },
      orderBy: { created_at: "asc" },
      take: 50,
    });

    // Real-time Revenue Ticker (last hour)
    const recentRevenue = await prisma.order_request.aggregate({
      where: {
        created_at: { gte: last1Hour },
        orderStatus: { not: "cancelled" },
      },
      _sum: { totalPayable: true },
      _count: true,
    });

    // Revenue breakdown by type (last hour)
    const revenueByType = await prisma.order_request.groupBy({
      by: ["orderType"],
      where: {
        created_at: { gte: last1Hour },
        orderStatus: { not: "cancelled" },
      },
      _sum: { totalPayable: true },
      _count: true,
    });

    // Active Users by Location (currently online)
    const liveUsersByLocation = await prisma.user_device_details.groupBy({
      by: ["deviceLocation"],
      where: {
        isActive: true,
        updated_at: { gte: last5Minutes },
      },
      _count: true,
      orderBy: { _count: { deviceLocation: "desc" } },
      take: 10,
    });

    // Busiest Astrologers (most active sessions right now)
    const busiestAstrologers = await prisma.$queryRaw<
      Array<{ astrologerId: bigint; activeSessions: number }>
    >`
      SELECT astrologerId, COUNT(*) as activeSessions
      FROM (
        SELECT astrologerId FROM chatrequest 
        WHERE chatStatus IN ('Accepted', 'InProgress', 'Ongoing')
          AND updated_at >= ${last30Minutes}
        UNION ALL
        SELECT astrologerId FROM callrequest 
        WHERE callStatus IN ('Accepted', 'InProgress', 'Ongoing')
          AND updated_at >= ${last30Minutes}
      ) as active_sessions
      WHERE astrologerId IS NOT NULL
      GROUP BY astrologerId
      ORDER BY activeSessions DESC
      LIMIT 10
    `;

    const astrologerIds = busiestAstrologers.map((a) => a.astrologerId);
    const astrologerDetails = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: {
        id: true,
        name: true,
        profileImage: true,
        chatStatus: true,
        callStatus: true,
      },
    });

    const busiestAstrologersWithDetails = busiestAstrologers.map((astro) => {
      const details = astrologerDetails.find((a) => a.id === astro.astrologerId);
      return {
        id: astro.astrologerId,
        name: details?.name || "Unknown",
        profileImage: details?.profileImage,
        activeSessions: Number(astro.activeSessions),
        chatStatus: details?.chatStatus,
        callStatus: details?.callStatus,
      };
    });

    // Recent Transactions (last 15 minutes)
    const recentTransactions = await prisma.payment.findMany({
      where: {
        created_at: { gte: last15Minutes },
      },
      orderBy: { created_at: "desc" },
      take: 20,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Average Wait Time (current)
    const currentWaitTimes = await prisma.astrologer_wait_lists.findMany({
      where: {
        isActive: true,
        isDelete: false,
        created_at: { gte: last30Minutes },
      },
      select: { waitingTime: true },
    });

    const avgWaitTime =
      currentWaitTimes.length > 0
        ? currentWaitTimes.reduce((sum, w) => sum + w.waitingTime, 0) /
          currentWaitTimes.length
        : 0;

    // System Load Indicators
    const systemLoad = {
      totalActiveSessions: activeChats + activeCalls,
      sessionsPerAstrologer:
        onlineAstrologers > 0 ? (activeChats + activeCalls) / onlineAstrologers : 0,
      waitlistRatio: onlineAstrologers > 0 ? waitlistCount / onlineAstrologers : 0,
      loadStatus:
        (activeChats + activeCalls) / Math.max(onlineAstrologers, 1) > 2
          ? "high"
          : (activeChats + activeCalls) / Math.max(onlineAstrologers, 1) > 1
          ? "medium"
          : "low",
    };

    // Activity Timeline (minute-by-minute for last 30 minutes)
    const activityTimeline = await prisma.$queryRaw<
      Array<{ minute: Date; chats: number; calls: number }>
    >`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:00') as minute,
        SUM(CASE WHEN source_table = 'chatrequest' THEN 1 ELSE 0 END) as chats,
        SUM(CASE WHEN source_table = 'callrequest' THEN 1 ELSE 0 END) as calls
      FROM (
        SELECT created_at, 'chatrequest' as source_table FROM chatrequest WHERE created_at >= ${last30Minutes}
        UNION ALL
        SELECT created_at, 'callrequest' as source_table FROM callrequest WHERE created_at >= ${last30Minutes}
      ) as combined
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:00')
      ORDER BY minute DESC
    `;

    const response: DashboardResponse = {
      success: true,
      data: {
        realtime: {
          activeChats,
          activeCalls,
          onlineAstrologers,
          onlineUsers,
          liveStreamingSessions,
          waitlistCount,
          avgWaitTime: Math.round(avgWaitTime),
        },
        recentActivity: {
          chats: recentChats.map((chat) => ({
            id: chat.id,
            status: chat.chatStatus,
            user: {
              id: chat.user?.id,
              name: chat.user?.name || "Unknown",
              profile: chat.user?.profile,
            },
            astrologer: {
              id: chat.astrologer?.id,
              name: chat.astrologer?.name || "Unknown",
              profileImage: chat.astrologer?.profileImage,
            },
            createdAt: chat.created_at,
          })),
          calls: recentCalls.map((call) => ({
            id: call.id,
            status: call.callStatus,
            type: call.call_type === 1 ? "video" : "audio",
            user: {
              id: call.user?.id,
              name: call.user?.name || "Unknown",
              profile: call.user?.profile,
            },
            astrologer: {
              id: call.astrologer?.id,
              name: call.astrologer?.name || "Unknown",
              profileImage: call.astrologer?.profileImage,
            },
            createdAt: call.created_at,
          })),
        },
        liveStreamers: liveStreamers.map((stream) => ({
          id: stream.id,
          channelName: stream.channelName,
          astrologer: {
            id: stream.astrologer?.id,
            name: stream.astrologer?.name || "Unknown",
            profileImage: stream.astrologer?.profileImage,
            skill: stream.astrologer?.primarySkill,
          },
          startedAt: stream.created_at,
        })),
        waitlist: waitlist.map((w) => ({
          id: w.id,
          userName: w.userName,
          profile: w.profile,
          waitTime: w.time,
          requestType: w.requestType,
          createdAt: w.created_at,
        })),
        revenue: {
          lastHour: Number(recentRevenue._sum.totalPayable || 0),
          transactions: recentRevenue._count,
          byType: revenueByType.map((r) => ({
            type: r.orderType || "Unknown",
            amount: Number(r._sum.totalPayable || 0),
            count: r._count,
          })),
          recentTransactions: recentTransactions.map((t) => ({
            id: t.id,
            amount: Number(t.amount || 0),
            method: t.paymentMode,
            status: t.paymentStatus,
            user: {
              id: t.user?.id,
              name: t.user?.name || "Unknown",
            },
            createdAt: t.created_at,
          })),
        },
        busiestAstrologers: busiestAstrologersWithDetails,
        usersByLocation: liveUsersByLocation.map((l) => ({
          location: l.deviceLocation || "Unknown",
          count: l._count,
        })),
        systemLoad,
        activityTimeline: activityTimeline.map((a) => ({
          time: a.minute,
          chats: Number(a.chats),
          calls: Number(a.calls),
          total: Number(a.chats) + Number(a.calls),
        })),
      },
      metadata: {
        filter: "live",
        dateRange: {
          startDate: last30Minutes,
          endDate: now,
        },
        generatedAt: now.toISOString(),
        refreshRecommended: 10, // seconds
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Live dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch live activity data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}