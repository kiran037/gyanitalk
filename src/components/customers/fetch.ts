"use server"
const prisma = require("../../prismaClient");

export async function getCustomers({
  page = 1,
  limit = 15,
  search = "",
  startDate,
  endDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {

  let startOfToday: Date | undefined;
  let endOfToday: Date | undefined;

  if (startDate) {
    startOfToday = new Date(startDate);
    startOfToday.setHours(0, 0, 0, 0);
  }

  if (endDate) {
    endOfToday = new Date(endDate);
    endOfToday.setHours(23, 59, 59, 999);
  }


  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);



  const offset = (page - 1) * limit;
  const baseWhere = {
    isActive: true,
    isDelete: false,
    ...(startDate && endDate && {
      created_at: {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      },
    }),
    OR: [
      {
        userRoles: {
          some: { roleId: 3 },
        },
      },
      {
        userRoles: {
          none: {},
        },
      },
      {
        birthDate: {
          gte: new Date("1000-01-01"),
        },
      },
      {
        birthDate: null,
      },
    ],
    ...(search &&
      isAlphaSearch && {
      name: { contains: search },
    }),
    ...(search &&
      isNumericSearch && {
      contactNo: { contains: search },
    }),
  };

  const [users, totalCount] = await Promise.all([
    prisma.users.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where: baseWhere,
      include: {
        user_wallets: {
          select: {
            amount: true,
          },
        },
      },
    }),

    prisma.users.count({
      where: baseWhere,
    }),
  ]);

  const data = users.map((user: User) => {
    const balance = user.user_wallets.reduce((acc, item) => {
      return acc + Number(item.amount || 0);
    }, 0);


    return {
      ...user,
      balance,
      created_at: user.created_at ? formatToIST(user.created_at) : null,
    };
  });


  return {
    data,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}


export async function getUserDetails({ id }: { id?: any }) {
  const userDetail = await prisma.users.findFirst({
    where: { id: Number(id) },
  });

  const callHistory = await prisma.callrequest.findMany({
    where: {
      userId: Number(id),
    },
    orderBy: {
      id: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          contactNo: true,
          profile: true,
        },
      },
      astrologer: {
        select: {
          name: true,
          charge: true,
          contactNo: true,
          profileImage: true
        },
      },
    },
  });

  const chatHistory = await prisma.chatrequest.findMany({
    where: {
      userId: Number(id),
    },
    orderBy: {
      id: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          contactNo: true,
          profile: true,
        },
      },
      astrologer: {
        select: {
          name: true,
          charge: true,
          contactNo: true,
          profileImage: true
        },
      },
    },
  });

  const dbOrders = await prisma.order_request.findMany({
    where: {
      userId: Number(id),
      orderType: 'astromall'
    },
    include: {
      product: true,
      order_address: true
    }
  })

  const orderDetails = dbOrders.map((order: any) => ({
    ...order,
    payableAmount: String(order.payableAmount),
    totalPayable: String(order.totalPayable),
    walletBalanceDeducted: String(order.walletBalanceDeducted),
    gstPercent: String(order.gstPercent),
  }));

  const walletTransactions = await prisma.wallettransaction.findMany({
    where: {
      userId: Number(id),
    },
    orderBy: {
      id: 'desc',
    },
    include: {
      order_request: {
        select: {
          totalMin: true,
          astrologer: {
            select: {
              name: true,
            },
          },
          aiAstrologer: {
            select: {
              name: true
            }
          }
        },
      },
    },
  });


  console.log(walletTransactions);
  

  return {
    userDetail,
    callHistory,
    chatHistory,
    orderDetails,
    walletTransactions
  };
}




type User = {
  id: bigint;
  name?: string;
  contactNo?: string;
  birthDate?: Date;
  birthTime?: string;
  profile?: string;
  user_wallets: {
    amount: number | string | null;
  }[];
  created_at: Date; // ✅ Add this

};




const formatToIST = (utcDate: Date) => {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(utcDate));
};


