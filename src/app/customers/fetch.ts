"use server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const prisma = require("../../prismaClient");

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper: Format date to IST
const formatToIST = (utcDate: Date | string | null) => {
  if (!utcDate) return null;
  return dayjs(utcDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
};

// Helper: Get IST date boundaries
function getISTDateBoundaries(startDateStr?: string, endDateStr?: string) {
  if (!startDateStr || !endDateStr) return {};

  const startOfDay = dayjs.tz(startDateStr, "Asia/Kolkata").startOf("day").toDate();
  const endOfDay = dayjs.tz(endDateStr, "Asia/Kolkata").endOf("day").toDate();

  return {
    created_at: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };
}

type User = {
  id: bigint;
  name?: string | null;
  contactNo?: string | null;
  birthDate?: Date | null;
  birthTime?: string | null;
  profile?: string | null;
  user_wallets: {
    amount: number | string | null;
  }[];
  created_at: Date | null;
};

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
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const offset = (page - 1) * limit;

  const baseWhere: any = {
    isActive: true,
    isDelete: false,
    ...getISTDateBoundaries(startDate, endDate),
    OR: [
      { userRoles: { some: { roleId: BigInt(3) } } },
      { userRoles: { none: {} } },
    ],
  };

  // Add search filters
  if (search) {
    if (isAlphaSearch) {
      baseWhere.name = { contains: search, mode: "insensitive" };
    } else if (isNumericSearch) {
      baseWhere.contactNo = { contains: search };
    }
  }

  const [users, totalCount] = await Promise.all([
    prisma.users.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where: baseWhere,
      include: {
        user_wallets: {
          select: { amount: true },
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
      id: String(user.id), // Convert BigInt to string for JSON serialization
      balance,
      created_at: formatToIST(user.created_at),
      birthDate: user.birthDate ? formatToIST(user.birthDate) : null,
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
        select: { amount: true },
      },
    },
  });

  const userDetail = userDetailRaw
    ? {
        ...userDetailRaw,
        id: String(userDetailRaw.id),
        birthDate: userDetailRaw.birthDate
          ? dayjs(userDetailRaw.birthDate).tz("Asia/Kolkata").format("YYYY-MM-DD")
          : null,
        created_at: formatToIST(userDetailRaw.created_at),
        updated_at: formatToIST(userDetailRaw.updated_at),
        user_wallets: userDetailRaw.user_wallets.map((w: { amount: any }) => ({
          ...w,
          amount: w.amount ? Number(w.amount) : 0,
        })),
      }
    : null;

  const callHistory = await prisma.callrequest.findMany({
    where: { userId: BigInt(id) },
    orderBy: { id: "desc" },
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
          profileImage: true,
        },
      },
    },
  });

  const chatHistory = await prisma.chatrequest.findMany({
    where: { userId: BigInt(id) },
    orderBy: { id: "desc" },
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
          profileImage: true,
        },
      },
    },
  });

  const dbOrders = await prisma.order_request.findMany({
    where: {
      userId: BigInt(id),
      orderType: "astromall",
    },
    include: {
      product: true,
      order_address: true,
    },
  });

  const orderDetails = dbOrders.map((order: any) => ({
    ...order,
    id: String(order.id),
    userId: String(order.userId),
    payableAmount: order.payableAmount ? String(order.payableAmount) : "0",
    totalPayable: order.totalPayable ? String(order.totalPayable) : "0",
    walletBalanceDeducted: order.walletBalanceDeducted
      ? String(order.walletBalanceDeducted)
      : "0",
    gstPercent: order.gstPercent ? String(order.gstPercent) : "0",
    created_at: formatToIST(order.created_at),
  }));

  const walletTransactions = await prisma.wallettransaction.findMany({
    where: { userId: BigInt(id) },
    orderBy: { id: "desc" },
    include: {
      order_request: {
        select: {
          totalMin: true,
          astrologer: {
            select: { name: true },
          },
          aiAstrologer: {
            select: { name: true },
          },
        },
      },
    },
  });

  const formattedTransactions = walletTransactions.map((txn: any) => ({
    ...txn,
    id: String(txn.id),
    userId: txn.userId ? String(txn.userId) : null,
    created_at: formatToIST(txn.created_at),
  }));

  const followersList = await prisma.astrologer_followers.findMany({
    where: { userId: BigInt(id) },
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

  const formattedFollowers = followersList.map((f: any) => ({
    ...f,
    id: String(f.id),
    userId: String(f.userId),
    astrologerId: f.astrologerId ? String(f.astrologerId) : null,
    aiAstrologerId: f.aiAstrologerId ? String(f.aiAstrologerId) : null,
    astrologer: f.astrologer
      ? { ...f.astrologer, id: String(f.astrologer.id) }
      : null,
    aiAstrologer: f.aiAstrologer
      ? { ...f.aiAstrologer, id: String(f.aiAstrologer.id) }
      : null,
    created_at: formatToIST(f.created_at),
  }));

  const notification = await prisma.user_notifications.findMany({
    where: { userId: BigInt(id) },
    orderBy: { id: "desc" },
  });

  const formattedNotifications = notification.map((n: any) => ({
    ...n,
    id: String(n.id),
    userId: String(n.userId),
    created_at: formatToIST(n.created_at),
  }));

  const astrologer_gifts_raw = await prisma.astrologer_gifts.findMany({
    where: { userId: BigInt(id) },
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
    id: String(item.id),
    userId: String(item.userId),
    astrologerId: String(item.astrologerId),
    giftId: String(item.giftId),
    giftAmount: item.giftAmount ? Number(item.giftAmount) : null,
    created_at: formatToIST(item.created_at),
  }));

  return {
    userDetail,
    callHistory: callHistory.map((c: any) => ({
      ...c,
      id: String(c.id),
      userId: String(c.userId),
      astrologerId: c.astrologerId ? String(c.astrologerId) : null,
      created_at: formatToIST(c.created_at),
    })),
    chatHistory: chatHistory.map((c: any) => ({
      ...c,
      id: String(c.id),
      userId: String(c.userId),
      astrologerId: String(c.astrologerId),
      created_at: formatToIST(c.created_at),
    })),
    orderDetails,
    walletTransactions: formattedTransactions,
    followersList: formattedFollowers,
    notification: formattedNotifications,
    gifts,
  };
}

export async function updateUserDetails({
  id,
  data,
}: {
  id: number;
  data: any;
}) {
  try {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.contactNo) updateData.contactNo = data.contactNo;
    if (data.email) updateData.email = data.email;
    if (data.birthDate) {
      updateData.birthDate = dayjs
        .tz(data.birthDate, "Asia/Kolkata")
        .toDate();
    }
    if (data.birthTime) updateData.birthTime = data.birthTime;
    if (data.birthPlace) updateData.birthPlace = data.birthPlace;
    if (data.addressLine1) updateData.addressLine1 = data.addressLine1;
    if (data.location) updateData.location = data.location;
    if (data.pincode) updateData.pincode = Number(data.pincode);
    if (data.gender) updateData.gender = data.gender;
    if (data.profile) updateData.profile = data.profile;

    const updated = await prisma.users.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return {
      status: true,
      message: "User updated successfully",
      data: {
        ...updated,
        id: String(updated.id),
      },
    };
  } catch (error: any) {
    console.error("updateUserDetails error:", error);
    return { status: false, message: error.message };
  }
}

export async function getAllCustomers({
  search = "",
  startDate,
  endDate,
}: {
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const baseWhere: any = {
    isActive: true,
    isDelete: false,
    ...getISTDateBoundaries(startDate, endDate),
    OR: [
      { userRoles: { some: { roleId: BigInt(3) } } },
      { userRoles: { none: {} } },
    ],
  };

  if (search) {
    if (isAlphaSearch) {
      baseWhere.name = { contains: search, mode: "insensitive" };
    } else if (isNumericSearch) {
      baseWhere.contactNo = { contains: search };
    }
  }

  const users = await prisma.users.findMany({
    where: baseWhere,
    orderBy: { id: "desc" },
    include: {
      user_wallets: {
        select: { amount: true },
      },
    },
  });

  const data = users.map((user: User) => {
    const balance = user.user_wallets.reduce((acc, item) => {
      return acc + Number(item.amount || 0);
    }, 0);

    return {
      ...user,
      id: String(user.id),
      balance,
      created_at: formatToIST(user.created_at),
      birthDate: user.birthDate ? formatToIST(user.birthDate) : null,
    };
  });

  return data;
}

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
    id: String(user.id),
    birthDate: user.birthDate
      ? dayjs(user.birthDate).tz("Asia/Kolkata").format("YYYY-MM-DD")
      : null,
    created_at: formatToIST(user.created_at),
    updated_at: formatToIST(user.updated_at),
    user_wallets: user.user_wallets.map((w: any) => ({
      amount: w?.amount ? Number(w.amount) : 0,
    })),
  };
}

export async function getUserChatHistoryOnly({ id }: { id: number | string }) {
  const chats = await prisma.chatrequest.findMany({
    where: { userId: BigInt(id) },
    orderBy: { id: "desc" },
    include: {
      user: { select: { name: true, contactNo: true, profile: true } },
      astrologer: {
        select: { name: true, charge: true, contactNo: true, profileImage: true },
      },
    },
  });

  return chats.map((c: any) => ({
    ...c,
    id: String(c.id),
    userId: String(c.userId),
    astrologerId: String(c.astrologerId),
    created_at: formatToIST(c.created_at),
  }));
}

export async function getUserCallHistoryOnly({ id }: { id: number | string }) {
  const calls = await prisma.callrequest.findMany({
    where: { userId: BigInt(id) },
    orderBy: { id: "desc" },
    include: {
      user: { select: { name: true, contactNo: true, profile: true } },
      astrologer: {
        select: { name: true, charge: true, contactNo: true, profileImage: true },
      },
    },
  });

  return calls.map((c: any) => ({
    ...c,
    id: String(c.id),
    userId: String(c.userId),
    astrologerId: c.astrologerId ? String(c.astrologerId) : null,
    created_at: formatToIST(c.created_at),
  }));
}

export async function getUserOrdersOnly({ id }: { id: number | string }) {
  const dbOrders = await prisma.order_request.findMany({
    where: { userId: BigInt(id), orderType: "astromall" },
    include: { product: true, order_address: true },
  });

  return dbOrders.map((o: any) => ({
    ...o,
    id: String(o.id),
    userId: String(o.userId),
    payableAmount: o.payableAmount ? String(o.payableAmount) : "0",
    totalPayable: o.totalPayable ? String(o.totalPayable) : "0",
    walletBalanceDeducted: o.walletBalanceDeducted
      ? String(o.walletBalanceDeducted)
      : "0",
    gstPercent: o.gstPercent ? String(o.gstPercent) : "0",
    created_at: formatToIST(o.created_at),
  }));
}

export async function getUserWalletTransactionsOnly({
  id,
}: {
  id: number | string;
}) {
  const txns = await prisma.wallettransaction.findMany({
    where: { userId: BigInt(id) },
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

  return txns.map((t: any) => ({
    ...t,
    id: String(t.id),
    userId: t.userId ? String(t.userId) : null,
    created_at: formatToIST(t.created_at),
  }));
}

export async function getUserFollowersOnly({ id }: { id: number | string }) {
  const followers = await prisma.astrologer_followers.findMany({
    where: { userId: BigInt(id) },
    include: {
      astrologer: {
        select: { id: true, name: true, contactNo: true, profileImage: true },
      },
      aiAstrologer: { select: { id: true, name: true, image: true } },
    },
  });

  return followers.map((f: any) => ({
    ...f,
    id: String(f.id),
    userId: String(f.userId),
    astrologerId: f.astrologerId ? String(f.astrologerId) : null,
    aiAstrologerId: f.aiAstrologerId ? String(f.aiAstrologerId) : null,
    astrologer: f.astrologer
      ? { ...f.astrologer, id: String(f.astrologer.id) }
      : null,
    aiAstrologer: f.aiAstrologer
      ? { ...f.aiAstrologer, id: String(f.aiAstrologer.id) }
      : null,
    created_at: formatToIST(f.created_at),
  }));
}

export async function getUserNotificationsOnly({ id }: { id: number | string }) {
  const notifications = await prisma.user_notifications.findMany({
    where: { userId: BigInt(id) },
    orderBy: { id: "desc" },
  });

  return notifications.map((n: any) => ({
    ...n,
    id: String(n.id),
    userId: String(n.userId),
    created_at: formatToIST(n.created_at),
  }));
}

export async function getUserGiftsOnly({ id }: { id: number | string }) {
  const rows = await prisma.astrologer_gifts.findMany({
    where: { userId: BigInt(id) },
    include: {
      astrologer: { select: { name: true, profileImage: true } },
      gift: { select: { id: true, name: true, image: true } },
    },
  });

  return rows.map((x: any) => ({
    ...x,
    id: String(x.id),
    userId: String(x.userId),
    astrologerId: String(x.astrologerId),
    giftId: String(x.giftId),
    giftAmount: x.giftAmount ? Number(x.giftAmount) : null,
    created_at: formatToIST(x.created_at),
  }));
}

export async function addMoneyToWallet({
  userId,
  amount,
}: {
  userId: number;
  amount: number;
}) {
  try {
    // 1. Log the payment
    const txn = await prisma.payment.create({
      data: {
        paymentMode: "Admin",
        amount: amount,
        paymentStatus: "success",
        userId: BigInt(userId),
        created_at: new Date(),
        createdBy: BigInt(userId),
        modifiedBy: BigInt(userId),
      },
    });

    // 2. Update or create wallet balance
    const existingWallet = await prisma.user_wallets.findFirst({
      where: { userId: BigInt(userId) },
    });

    if (existingWallet) {
      await prisma.user_wallets.update({
        where: { id: existingWallet.id },
        data: {
          amount: Number(existingWallet.amount || 0) + Number(amount),
          modifiedBy: Number(userId),
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.user_wallets.create({
        data: {
          userId: BigInt(userId),
          amount: amount,
          isActive: true,
          isDelete: false,
          created_at: new Date(),
          createdBy: Number(userId),
          modifiedBy: Number(userId),
        },
      });
    }

    // 3. Create wallet transaction record
    await prisma.wallettransaction.create({
      data: {
        userId: BigInt(userId),
        amount: amount,
        transactionType: "Admin Credit",
        isCredit: true,
        created_at: new Date(),
        createdBy: Number(userId),
        modifiedBy: Number(userId),
      },
    });

    return {
      status: true,
      message: `₹${amount} added successfully`,
      transaction: {
        ...txn,
        id: String(txn.id),
        userId: String(txn.userId),
      },
    };
  } catch (err: any) {
    console.error("addMoneyToWallet error:", err);
    return { status: false, message: err.message };
  }
}

export async function searchCustomers(query: string) {
  if (!query) return [];

  const isNumeric = /^\d+$/.test(query);
  const isAlpha = /[a-zA-Z]/.test(query);

  const users = await prisma.users.findMany({
    where: {
      isActive: true,
      isDelete: false,
      ...(isAlpha && { name: { contains: query, mode: "insensitive" } }),
      ...(isNumeric && { contactNo: { contains: query } }),
    },
    orderBy: { id: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      contactNo: true,
      profile: true,
    },
  });

  return users.map((u: any) => ({
    ...u,
    id: String(u.id),
  }));
}

export async function addCustomer(data: {
  name: string;
  birthDate?: string;
  birthTime?: string;
  pincode?: string;
  city?: string;
  gender?: string;
  email?: string;
  contactNo?: string;
  address?: string;
  profile?: string;
}) {
  try {
    const newUser = await prisma.users.create({
      data: {
        name: data.name,
        birthDate: data.birthDate
          ? dayjs.tz(data.birthDate, "Asia/Kolkata").toDate()
          : null,
        birthTime: data.birthTime || null,
        pincode: data.pincode ? Number(data.pincode) : null,
        location: data.city || null,
        gender: data.gender || null,
        email: data.email || null,
        contactNo: data.contactNo || null,
        addressLine2: data.address || null,
        profile: data.profile || null,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Get signup bonus from system flag
    const systemFlag = await prisma.systemflag.findFirst({
      where: { name: "SignupBonus" },
    });
    const bonusAmount = systemFlag ? Number(systemFlag.value) : 0;

    // Create wallet with signup bonus
    await prisma.user_wallets.create({
      data: {
        userId: BigInt(newUser.id),
        amount: bonusAmount,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        createdBy: Number(newUser.id),
        modifiedBy: Number(newUser.id),
      },
    });

    // Log signup bonus transaction
    if (bonusAmount > 0) {
      await prisma.wallettransaction.create({
        data: {
          userId: BigInt(newUser.id),
          amount: bonusAmount,
          transactionType: "SignupBonus",
          isCredit: true,
          created_at: new Date(),
          createdBy: Number(newUser.id),
          modifiedBy: Number(newUser.id),
        },
      });
    }

    return {
      status: true,
      message: "Customer added successfully",
      user: {
        ...newUser,
        id: String(newUser.id),
      },
    };
  } catch (err: any) {
    console.error("addCustomer error:", err);
    return { status: false, message: err.message };
  }
}