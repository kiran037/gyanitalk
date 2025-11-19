import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { prisma } from "@/lib/prisma";

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper to get IST date boundaries
function getISTDateBoundaries() {
  const nowIST = dayjs().tz("Asia/Kolkata");
  const startOfToday = nowIST.startOf('day').toDate();
  const endOfToday = nowIST.endOf('day').toDate();
  
  return { startOfToday, endOfToday, today: startOfToday };
}

// Helper to sum totalMin fields
function sumTotalMin(items: { totalMin: string | null }[]): number {
  return items.reduce((acc, cur) => {
    const val = parseInt(cur.totalMin || "0", 10);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}

// Helper to normalize deposit data
function normalizeDepositMap(
  depositArr: Array<{
    paymentStatus: string | null;
    _sum: { amount: number | null };
  }>
): { success: number; failed: number; pending: number } {
  const map: Record<string, number> = {};
  
  depositArr.forEach((item) => {
    const status = (item.paymentStatus || "").toLowerCase();
    const amount = item._sum.amount || 0;
    map[status] = (map[status] || 0) + amount;
  });

  return {
    success: map.success || 0,
    failed: map.failed || 0,
    pending: map.pending || 0,
  };
}

export async function getDashboardOverview() {
  const { startOfToday, endOfToday, today } = getISTDateBoundaries();

  // ==== CALL REQUESTS ====
  const [
    totalCallRequest,
    completedCalls,
    todayCallRequest,
    todayCallRequestReject,
    todayCallRequestList
  ] = await Promise.all([
    prisma.callrequest.count(),
    
    prisma.callrequest.findMany({
      where: { callStatus: "Completed" },
      select: { totalMin: true }
    }),
    
    prisma.callrequest.count({
      where: {
        created_at: { gte: startOfToday, lte: endOfToday }
      }
    }),
    
    prisma.callrequest.count({
      where: {
        callStatus: "Rejected",
        created_at: { gte: startOfToday, lte: endOfToday }
      }
    }),
    
    prisma.callrequest.findMany({
      where: {
        created_at: { gte: startOfToday, lte: endOfToday }
      },
      select: { totalMin: true }
    })
  ]);

  // ==== CHAT REQUESTS ====
  const [
    totalChatRequest,
    completedChats,
    todayChatRequest,
    todayChatRequestReject,
    todayChatRequestList
  ] = await Promise.all([
    prisma.chatrequest.count(),
    
    prisma.chatrequest.findMany({
      where: { chatStatus: "Completed" },
      select: { totalMin: true }
    }),
    
    prisma.chatrequest.count({
      where: {
        created_at: { gte: startOfToday, lte: endOfToday }
      }
    }),
    
    prisma.chatrequest.count({
      where: {
        chatStatus: "Rejected",
        created_at: { gte: startOfToday, lte: endOfToday }
      }
    }),
    
    prisma.chatrequest.findMany({
      where: {
        created_at: { gte: startOfToday, lte: endOfToday }
      },
      select: { totalMin: true }
    })
  ]);

  // ==== USERS & CUSTOMERS ====
  const [totalReportRequest, totalCustomer, todayCustomer] = await Promise.all([
    prisma.user_reports.count(),
    
    prisma.users.count({
      where: {
        isActive: true,
        isDelete: false,
        OR: [
          { userRoles: { some: { roleId: BigInt(3) } } },
          { userRoles: { none: {} } }
        ]
      }
    }),
    
    prisma.users.count({
      where: {
        created_at: { gte: startOfToday, lte: endOfToday },
        isActive: true,
        isDelete: false,
        OR: [
          { userRoles: { some: { roleId: BigInt(3) } } },
          { userRoles: { none: {} } }
        ]
      }
    })
  ]);

  // Active customers (with chat/call transactions)
  const usersWithTx = await prisma.wallettransaction.findMany({
    where: {
      transactionType: { in: ["Chat", "Call"] }
    },
    select: { userId: true },
    distinct: ['userId']
  });

  const activeUserIds = usersWithTx
    .map((tx: { userId: bigint | null }) => tx.userId)
    .filter((id: bigint | null): id is bigint => id !== null);

  const totalActiveCustomer = await prisma.users.count({
    where: {
      id: { in: activeUserIds },
      isActive: true,
      isDelete: false,
      OR: [
        { userRoles: { some: { roleId: BigInt(3) } } },
        { userRoles: { none: {} } }
      ]
    }
  });

  // ==== ASTROLOGERS & ORDERS ====
  const [
    totalAstrologer,
    unverifiedAstrologer,
    totalOrders,
    totalLiveAstro,
    totalLiveChat,
    totalLiveCall,
    totalRequest
  ] = await Promise.all([
    prisma.astrologers.count({
      where: { isActive: true, isDelete: false }
    }),
    
    prisma.astrologers.count({
      where: { 
        isVerified: false,
        isActive: true,
        isDelete: false
      }
    }),
    
    prisma.order_request.count({
      where: { orderType: "astromall" }
    }),
    
    prisma.liveastro.count({
      where: { isActive: 1 }
    }),
    
    prisma.astrologers.count({
      where: { 
        chatStatus: "Online",
        isActive: true,
        isDelete: false
      }
    }),
    
    prisma.astrologers.count({
      where: { 
        callStatus: "Online",
        isActive: true,
        isDelete: false
      }
    }),
    
    prisma.astrologer_request.count({
      where: { status: "Pending" }
    })
  ]);

  // ==== EARNINGS (Admin commissions) ====
  const [totalEarningResult, todayEarningResult] = await Promise.all([
    prisma.admin_get_commissions.aggregate({
      _sum: { amount: true }
    }),
    
    prisma.admin_get_commissions.aggregate({
      where: {
        created_at: { gte: startOfToday, lte: endOfToday }
      },
      _sum: { amount: true }
    })
  ]);

  // ==== ASTROLOGER EARNINGS (Wallet transactions for astrologers) ====
  const astrologerUserRoles = await prisma.user_roles.findMany({
    where: { roleId: BigInt(2) },
    select: { userId: true }
  });

  const astrologerUserIds = astrologerUserRoles.map(
    (ur: { userId: bigint }) => ur.userId
  );

  const [totalAstroEarningResult, todayAstroEarningResult] = await Promise.all([
    prisma.wallettransaction.aggregate({
      where: {
        userId: { in: astrologerUserIds },
        isCredit: true
      },
      _sum: { amount: true }
    }),
    
    prisma.wallettransaction.aggregate({
      where: {
        userId: { in: astrologerUserIds },
        isCredit: true,
        created_at: { gte: startOfToday, lte: endOfToday }
      },
      _sum: { amount: true }
    })
  ]);

  // ==== WITHDRAWALS ====
  const [totalWithdraw, todayWithdraw] = await Promise.all([
    prisma.withdrawrequest.aggregate({
      where: { status: "Released" },
      _sum: { withdrawAmount: true }
    }),
    
    prisma.withdrawrequest.aggregate({
      where: {
        status: "Released",
        created_at: { gte: startOfToday, lte: endOfToday }
      },
      _sum: { withdrawAmount: true }
    })
  ]);

  // ==== DEPOSITS (Payments) ====
  const [totalDepositByStatus, todayDepositByStatus] = await Promise.all([
    prisma.payment.groupBy({
      by: ["paymentStatus"],
      _sum: { amount: true }
    }),
    
    prisma.payment.groupBy({
      by: ["paymentStatus"],
      where: {
        created_at: { gte: startOfToday, lte: endOfToday }
      },
      _sum: { amount: true }
    })
  ]);

  const totalDepositMap = normalizeDepositMap(totalDepositByStatus);
  const todayDepositMap = normalizeDepositMap(todayDepositByStatus);

  // ==== EXPERT ASTRO MATCH (Astrologer requests) ====
  const [pendingRequests, successRequests] = await Promise.all([
    prisma.astrologer_request.count({
      where: { status: "Pending" }
    }),
    
    prisma.astrologer_request.count({
      where: { status: "Assigned" }
    })
  ]);

  // ==== RETURN DATA ====
  return {
    // Call metrics
    totalCallRequest,
    totalCallCompleteRequest: {
      count: completedCalls.length,
      time: sumTotalMin(completedCalls)
    },
    todayCallRequest,
    todayCallRequestReject,
    todayCallRequestTime: sumTotalMin(todayCallRequestList),

    // Chat metrics
    totalChatRequest,
    totalChatComplteRequest: {
      count: completedChats.length,
      time: sumTotalMin(completedChats)
    },
    todayChatRequest,
    todayChatRequestReject,
    todayChatRequestTime: sumTotalMin(todayChatRequestList),

    // Customer metrics
    totalCustomer,
    totalActiveCustomer,
    todayCustomer,
    totalReportRequest,

    // Astrologer metrics
    totalAstrologer,
    unverifiedAstrologer,
    totalOrders,
    totalLiveAstro,
    totalLiveChat,
    totalLiveCall,
    totalRequest,

    // Financial metrics
    totalEarning: Number(totalEarningResult._sum.amount || 0),
    todayEarning: Number(todayEarningResult._sum.amount || 0),
    totalAstroEarning: Number(totalAstroEarningResult._sum.amount || 0),
    todayAstroEarning: Number(todayAstroEarningResult._sum.amount || 0),
    totalWithdraw: Number(totalWithdraw._sum.withdrawAmount || 0),
    todayWithdraw: Number(todayWithdraw._sum.withdrawAmount || 0),

    // Deposit metrics
    totalDeposit: totalDepositMap,
    todayDeposit: todayDepositMap,

    // Expert match metrics
    pendingRequests,
    successRequests
  };
}

export async function getDashboardChartData() {
  const nowIST = dayjs().tz("Asia/Kolkata");
  const months: string[] = [];

  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    months.push(nowIST.subtract(i, "month").format("YYYY-MM"));
  }

  const labels: string[] = [];
  const callData: number[] = [];
  const chatData: number[] = [];
  const earningData: number[] = [];
  const userData: number[] = [];

  for (const monthStr of months) {
    const [year, month] = monthStr.split("-").map(Number);
    
    // Create date range in IST
    const fromDate = dayjs.tz(`${year}-${month.toString().padStart(2, '0')}-01`, "Asia/Kolkata")
      .startOf('month')
      .toDate();
    
    const toDate = dayjs.tz(`${year}-${month.toString().padStart(2, '0')}-01`, "Asia/Kolkata")
      .add(1, 'month')
      .startOf('month')
      .toDate();

    labels.push(dayjs(`${monthStr}-01`).format("MMM YYYY"));

    const [callCount, chatCount, userCount, earningSumResult] = await Promise.all([
      prisma.callrequest.count({
        where: {
          created_at: { gte: fromDate, lt: toDate }
        }
      }),

      prisma.chatrequest.count({
        where: {
          created_at: { gte: fromDate, lt: toDate }
        }
      }),

      prisma.users.count({
        where: {
          created_at: { gte: fromDate, lt: toDate },
          isActive: true,
          isDelete: false
        }
      }),

      prisma.admin_get_commissions.aggregate({
        where: {
          created_at: { gte: fromDate, lt: toDate }
        },
        _sum: { amount: true }
      })
    ]);

    callData.push(callCount);
    chatData.push(chatCount);
    userData.push(userCount);
    earningData.push(Number(earningSumResult._sum.amount || 0));
  }

  return {
    labels,
    callData,
    chatData,
    earningData,
    userData
  };
}