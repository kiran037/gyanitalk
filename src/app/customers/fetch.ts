///Users/xeoren/gyanitallk-admin/src/components/customers/fetch.ts
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
  const userDetailRaw = await prisma.users.findFirst({
    where: { id: Number(id) },
    include: {
      user_wallets: {
        select: {
          amount: true,
        },
      },
    },
  });

  const userDetail = userDetailRaw
    ? {
      ...userDetailRaw,
      birthDate: userDetailRaw.birthDate
        ? userDetailRaw.birthDate.toISOString()
        : null,
      created_at: userDetailRaw.created_at
        ? userDetailRaw.created_at.toISOString()
        : null,
      updated_at: userDetailRaw.updated_at
        ? userDetailRaw.updated_at.toISOString()
        : null,
      user_wallets: userDetailRaw.user_wallets.map((w: { amount: any; }) => ({
        ...w,
        amount: w.amount ? Number(w.amount) : 0,
      })),
    }
    : null;


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

  const followersList = await prisma.astrologer_followers.findMany({
    where: { userId: Number(id) },
    include: {
      astrologer: {
        select: {
          id: true,
          name: true,
          contactNo: true,
          profileImage: true,
        },
      },
      aiAstrologer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },

    },
  });

  const notification = await prisma.user_notifications.findMany({
    where: { userId: Number(id) }
  });


  const astrologer_gifts_raw = await prisma.astrologer_gifts.findMany({
    where: {
      userId: Number(id),
    },
    include: {
      astrologer: {
        select: {
          name: true,
          profileImage: true,
        },
      },
      gift: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  const gifts = astrologer_gifts_raw.map((item: any) => ({
    ...item,
    giftAmount: item.giftAmount?.toNumber() ?? null,
  }));


  return {
    userDetail,
    callHistory,
    chatHistory,
    orderDetails,
    walletTransactions,
    followersList,
    notification,
    gifts
  };
}

export async function updateUserDetails({ id, data }: { id: number; data: any }) {
  try {
    const updated = await prisma.users.update({
      where: { id: Number(id) },
      data: {
        name: data.name || undefined,
        contactNo: data.contactNo || undefined,
        email: data.email || undefined,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        birthTime: data.birthTime || undefined,
        birthPlace: data.birthPlace || undefined,
        addressLine1: data.addressLine1 || undefined,
        location: data.location || undefined,
        pincode: data.pincode ? Number(data.pincode) : undefined,
        gender: data.gender || undefined,
        profile: data.profile || undefined, // only if you already uploaded image and saved path
        updated_at: new Date(),
      },
    });

    return { status: true, message: "User updated successfully", data: updated };
  } catch (error: any) {
    console.error("updateUserDetails error:", error);
    return { status: false, message: error.message };
  }
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
  created_at: Date;

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



export async function getAllCustomers({
  search = "",
  startDate,
  endDate,
}: {
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  // Prepare filters for raw SQL WHERE clause
  const searchNameFilter = /[a-zA-Z]/.test(search) ? `AND name LIKE '%${search}%'` : "";
  const searchContactFilter = /^\d+$/.test(search) ? `AND contactNo LIKE '%${search}%'` : "";
  const dateFilter =
    startDate && endDate
      ? `AND created_at BETWEEN '${startDate}' AND '${new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()}'`
      : "";

  // Raw SQL query to exclude invalid birthDate (month=0 or day=0)
  const rawQuery = `
    SELECT u.*, 
      (SELECT SUM(amount) FROM user_wallets uw WHERE uw.userId = u.id) as balance
    FROM users u
    WHERE u.isActive = true
      AND u.isDelete = false
      AND (u.birthDate IS NULL OR (MONTH(u.birthDate) != 0 AND DAY(u.birthDate) != 0))
      ${searchNameFilter}
      ${searchContactFilter}
      ${dateFilter}
    ORDER BY u.id DESC
  `;

  const users: Array<any> = await prisma.$queryRawUnsafe(rawQuery);

  // Map and format data
  const data = users.map((user: any) => ({
    ...user,
    balance: user.balance || 0,
    created_at: user.created_at ? formatToIST(new Date(user.created_at)) : null,
  }));

  return data;
}

// --- ADD: lightweight summary only (no heavy lists) ---
export async function getUserSummary({ id }: { id: number | string }) {
  const user = await prisma.users.findFirst({
    where: { id: Number(id) },
    include: {
      user_wallets: { select: { amount: true } },
    },
  });

  if (!user) return null;

  return {
    ...user,
    birthDate: user.birthDate ? user.birthDate.toISOString() : null,
    created_at: user.created_at ? user.created_at.toISOString() : null,
    updated_at: user.updated_at ? user.updated_at.toISOString() : null,
    user_wallets: user.user_wallets.map((w: any) => ({
      amount: w?.amount ? Number(w.amount) : 0,
    })),
  };
}

// --- ADD: per-tab fetchers (1 call = 1 tab) ---
export async function getUserChatHistoryOnly({ id }: { id: number | string }) {
  return prisma.chatrequest.findMany({
    where: { userId: Number(id) },
    orderBy: { id: "desc" },
    include: {
      user: { select: { name: true, contactNo: true, profile: true } },
      astrologer: { select: { name: true, charge: true, contactNo: true, profileImage: true } },
    },
  });
}

export async function getUserCallHistoryOnly({ id }: { id: number | string }) {
  return prisma.callrequest.findMany({
    where: { userId: Number(id) },
    orderBy: { id: "desc" },
    include: {
      user: { select: { name: true, contactNo: true, profile: true } },
      astrologer: { select: { name: true, charge: true, contactNo: true, profileImage: true } },
    },
  });
}

export async function getUserOrdersOnly({ id }: { id: number | string }) {
  const dbOrders = await prisma.order_request.findMany({
    where: { userId: Number(id), orderType: "astromall" },
    include: { product: true, order_address: true },
  });
  return dbOrders.map((o: any) => ({
    ...o,
    payableAmount: String(o.payableAmount),
    totalPayable: String(o.totalPayable),
    walletBalanceDeducted: String(o.walletBalanceDeducted),
    gstPercent: String(o.gstPercent),
  }));
}

export async function getUserWalletTransactionsOnly({ id }: { id: number | string }) {
  return prisma.wallettransaction.findMany({
    where: { userId: Number(id) },
    orderBy: { id: "desc" },
    include: {
      order_request: {
        select: {
          totalMin: true,
          astrologer: { select: { name: true } },
          aiAstrologer: { select: { name: true } },
        },
      },
    },
  });
}

export async function getUserFollowersOnly({ id }: { id: number | string }) {
  return prisma.astrologer_followers.findMany({
    where: { userId: Number(id) },
    include: {
      astrologer: { select: { id: true, name: true, contactNo: true, profileImage: true } },
      aiAstrologer: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function getUserNotificationsOnly({ id }: { id: number | string }) {
  return prisma.user_notifications.findMany({ where: { userId: Number(id) } });
}

export async function getUserGiftsOnly({ id }: { id: number | string }) {
  const rows = await prisma.astrologer_gifts.findMany({
    where: { userId: Number(id) },
    include: {
      astrologer: { select: { name: true, profileImage: true } },
      gift: { select: { id: true, name: true, image: true } },
    },
  });
  return rows.map((x: any) => ({ ...x, giftAmount: x.giftAmount?.toNumber() ?? null }));
}
