import dayjs from "dayjs";
const prisma = require("../../prismaClient");
import { startOfDay, endOfDay } from 'date-fns';


export async function getDashboardOverview() {
  const today = new Date(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const start = startOfDay(today);
  const end = endOfDay(today);

  const statuses = ['success', 'failed', 'pending'] as const;

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
      where: { created_at: { gte: today } },
    }),
    prisma.callrequest.count({
      where: {
        callStatus: "Rejected",
        created_at: { gte: today },
      },
    }),
    prisma.callrequest.findMany({
      where: { created_at: { gte: today } },
      select: { totalMin: true },
    }),
  ]);

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
      where: { created_at: { gte: today } },
    }),
    prisma.chatrequest.count({
      where: { chatStatus: "Rejected", created_at: { gte: today } },
    }),
    prisma.chatrequest.findMany({
      where: { created_at: { gte: today } },
      select: { totalMin: true },
    }),
  ]);

  const sumTotalMin = (items: { totalMin: string | null }[]) =>
    items.reduce((acc, cur) => acc + (parseInt(cur.totalMin || "0", 10) || 0), 0);



  const totalReportRequest = await prisma.user_reports.count();
  const totalCustomer = await prisma.users.count({
    where: {
      OR: [
        { userRoles: { some: { roleId: 3 } } },
        { userRoles: { none: {} } },
      ],
      isActive: true,
      isDelete: false,
    },
  });


  const todayCustomer = await prisma.users.count({
    where: {
      created_at: { gte: today },
      OR: [
        { userRoles: { some: { roleId: 3 } } },
        { userRoles: { none: {} } },
      ],
      isActive: true,
      isDelete: false,
    },
  });

  const usersWithChatOrCallTx: { userId: bigint | null }[] = await prisma.wallettransaction.findMany({
    where: {
      transactionType: { in: ["Chat", "Call"] },
    },
    select: {
      userId: true,
    },
  });

  const userIdsWithTx = Array.from(
    new Set(
      usersWithChatOrCallTx
        .map((tx) => tx.userId)
        .filter((id): id is bigint => id !== null)
    )
  );


  const totalActiveCustomer = await prisma.users.count({
    where: {
      id: { in: userIdsWithTx },
      isActive: true,
      isDelete: false,
      OR: [
        { userRoles: { some: { roleId: 3 } } },
        { userRoles: { none: {} } },
      ],
    },
  });



  const [totalAstrologer, totalOrders, totalLiveAstro, totalLiveChat, totalLiveCall, totalRequest] = await Promise.all([
    prisma.astrologers.count(),
    prisma.order_request.count({ where: { orderType: "astromall" } }),
    prisma.liveastro.count({ where: { isActive: 1 } }),
    prisma.astrologers.count({ where: { chatStatus: "Online" } }),
    prisma.astrologers.count({ where: { callStatus: "Online" } }),
    prisma.astrologer_request.count({ where: { status: "Pending" } }),
  ]);

  const unverifiedAstrologer = await prisma.astrologers.count({
    where: { isVerified: false },
  });


  const totalEarningResult = await prisma.admin_get_commissions.aggregate({
    _sum: {
      amount: true,
    },
  });

  const todayEarningResult = await prisma.admin_get_commissions.aggregate({
    where: {
      created_at: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    _sum: {
      amount: true,
    },
  });



  const astrologerUserIds = await prisma.user_roles.findMany({
    where: {
      roleId: 2,
    },
    select: {
      userId: true,
    },
  });

  const userIds = astrologerUserIds.map((ur: { userId: bigint }) => Number(ur.userId));

  const totalAstroEarningResult = await prisma.wallettransaction.aggregate({
    where: {
      userId: {
        in: userIds,
      },
    },
    _sum: {
      amount: true,
    },
  });


  // Step 2: Sum today's wallet transactions for those user IDs
  const todayAstroEarningResult = await prisma.wallettransaction.aggregate({
    where: {
      userId: {
        in: userIds,
      },
      created_at: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
    },
  });




  const [totalWithdraw, todayWithdraw] = await Promise.all([
    prisma.withdrawrequest.aggregate({
      where: {
        status: 'Released'
      },
      _sum: {
        withdrawAmount: true,
      },
    }),
    prisma.withdrawrequest.aggregate({
      where: {
        status: 'Released',
        created_at: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      _sum: {
        withdrawAmount: true,
      },
    }),
  ]);


  const [totalDepositByStatus, todayDepositByStatus] = await Promise.all([
    prisma.payment.groupBy({
      by: ['paymentStatus'],
      _sum: {
        amount: true,
      },
    }),
    prisma.payment.groupBy({
      by: ['paymentStatus'],
      where: {
        created_at: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const normalizeDepositMap = (
    depositArr: typeof totalDepositByStatus
  ): Record<typeof statuses[number], number> => {
    const depositMap = Object.fromEntries(
      depositArr.map((item: DepositGroup) => [item.paymentStatus ?? 'Unknown', item._sum.amount])
    );

    return statuses.reduce((acc, status) => {
      const val = depositMap[status];
      acc[status] = val !== null && val !== undefined ? val : 0;
      return acc;
    }, {} as Record<typeof statuses[number], number>);
  };

  const totalDepositMap = normalizeDepositMap(totalDepositByStatus);
  const todayDepositMap = normalizeDepositMap(todayDepositByStatus);



  const [pendingRequests, successRequests] = await Promise.all([
    prisma.astrologer_request.count({ where: { status: 'Pending' } }),
    prisma.astrologer_request.count({ where: { status: 'Assigned' } }),
  ]);


  return {
    totalCallRequest,
    totalChatRequest,
    totalReportRequest,
    totalCustomer,
    totalActiveCustomer,
    todayCustomer,
    totalAstrologer,
    totalOrders,
    totalLiveAstro,
    totalLiveChat,
    totalLiveCall,
    totalRequest,
    totalCallCompleteRequest: {
      count: completedCalls.length,
      time: sumTotalMin(completedCalls),
    },
    totalChatComplteRequest: {
      count: completedChats.length,
      time: sumTotalMin(completedChats),
    },
    todayCallRequest,
    todayCallRequestReject,
    todayCallRequestTime: sumTotalMin(todayCallRequestList),
    todayChatRequest,
    todayChatRequestReject,
    todayChatRequestTime: sumTotalMin(todayChatRequestList),
    unverifiedAstrologer,


    totalEarning: totalEarningResult._sum.amount ?? 0,
    todayEarning: todayEarningResult._sum.amount ?? 0,
    totalAstroEarning: totalAstroEarningResult._sum.amount ?? 0,
    todayAstroEarning: todayAstroEarningResult._sum.amount ?? 0,

    totalWithdraw: totalWithdraw._sum.withdrawAmount ?? 0,
    todayWithdraw: todayWithdraw._sum.withdrawAmount ?? 0,

    totalDeposit: totalDepositMap,
    todayDeposit: todayDepositMap,
    pendingRequests, successRequests,


  };
}


export async function getDashboardChartData() {
  const today = dayjs();
  const months = [];

  for (let i = 11; i >= 0; i--) {
    months.push(today.subtract(i, 'month').format('YYYY-MM'));
  }

  const callData = [];
  const chatData = [];
  const reportData = [];
  const earningData = [];
  const labels = [];

  for (const monthStr of months) {
    const [year, month] = monthStr.split('-').map(Number);
    labels.push(dayjs(monthStr + '-01').format('MMM YYYY'));

    const callCount = await prisma.callrequest.count({
      where: {
        created_at: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    const chatCount = await prisma.chatrequest.count({
      where: {
        created_at: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    const reportCount = await prisma.user_reports.count({
      where: {
        created_at: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    const earningSumResult = await prisma.admin_get_commissions.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        created_at: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    callData.push(callCount);
    chatData.push(chatCount);
    reportData.push(reportCount);
    earningData.push(earningSumResult._sum.amount || 0);
  }

  return {
    labels,
    callData,
    chatData,
    reportData,
    earningData,
  };
}





export async function getChatsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      name: "Jacob Jones",
      profile: "/images/user/user-01.png",
      isActive: true,
      lastMessage: {
        content: "See you tomorrow at the meeting!",
        type: "text",
        timestamp: "2024-12-19T14:30:00Z",
        isRead: false,
      },
      unreadCount: 3,
    },
    {
      name: "Wilium Smith",
      profile: "/images/user/user-03.png",
      isActive: true,
      lastMessage: {
        content: "Thanks for the update",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "Johurul Haque",
      profile: "/images/user/user-04.png",
      isActive: false,
      lastMessage: {
        content: "What's up?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "M. Chowdhury",
      profile: "/images/user/user-05.png",
      isActive: false,
      lastMessage: {
        content: "Where are you now?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 2,
    },
    {
      name: "Akagami",
      profile: "/images/user/user-07.png",
      isActive: false,
      lastMessage: {
        content: "Hey, how are you?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
  ];
}


type DepositGroup = {
  paymentStatus: string | null;
  _sum: {
    amount: number | null;
  };
};