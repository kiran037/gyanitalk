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

export async function getWalletTransactions({
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

  // Build the where clause with IST date handling
  const baseWhere: any = {
    ...getISTDateBoundaries(startDate, endDate),
  };

  // Add search filters
  if (search) {
    if (isAlphaSearch) {
      baseWhere.user = {
        name: { contains: search, mode: "insensitive" },
      };
    } else if (isNumericSearch) {
      baseWhere.user = {
        contactNo: { contains: search },
      };
    }
  }

  // Get paginated records, total count, and summary in parallel
  const [records, totalCount, summaryData] = await Promise.all([
    // Paginated records
    prisma.wallettransaction.findMany({
      skip: offset,
      take: limit,
      where: baseWhere,
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
            contactNo: true,
          },
        },
        astrologer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        ai_astrologer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        order_request: {
          select: {
            id: true,
            orderType: true,
            totalMin: true,
          },
        },
      },
    }),

    // Total count
    prisma.wallettransaction.count({
      where: baseWhere,
    }),

    // Summary aggregation
    prisma.wallettransaction.aggregate({
      where: baseWhere,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Calculate separate credit and debit totals
  const [creditSum, debitSum] = await Promise.all([
    prisma.wallettransaction.aggregate({
      where: {
        ...baseWhere,
        isCredit: true,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.wallettransaction.aggregate({
      where: {
        ...baseWhere,
        isCredit: false,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  // Format records with BigInt conversion and IST dates
  const formattedRecords = records.map((record: any) => ({
    ...record,
    id: String(record.id),
    userId: record.userId ? String(record.userId) : null,
    astrologerId: record.astrologerId ? String(record.astrologerId) : null,
    aiAstrologerId: record.aiAstrologerId ? String(record.aiAstrologerId) : null,
    orderId: record.orderId ? String(record.orderId) : null,
    amount: Number(record.amount || 0),
    created_at: formatToIST(record.created_at),
    updated_at: formatToIST(record.updated_at),
    user: record.user
      ? {
          ...record.user,
          id: String(record.user.id),
        }
      : null,
    astrologer: record.astrologer
      ? {
          ...record.astrologer,
          id: String(record.astrologer.id),
        }
      : null,
    ai_astrologer: record.ai_astrologer
      ? {
          ...record.ai_astrologer,
          id: String(record.ai_astrologer.id),
        }
      : null,
    order_request: record.order_request
      ? {
          ...record.order_request,
          id: String(record.order_request.id),
        }
      : null,
  }));

  const summary = {
    totalCredits: Number(creditSum._sum.amount || 0),
    totalDebits: Number(debitSum._sum.amount || 0),
    totalTransactions: summaryData._count.id,
    netBalance: Number(creditSum._sum.amount || 0) - Number(debitSum._sum.amount || 0),
  };

  return {
    records: formattedRecords,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    summary,
  };
}

export async function getPaymentTransactions({
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
    ...getISTDateBoundaries(startDate, endDate),
  };

  // Add search filters
  if (search) {
    if (isAlphaSearch) {
      baseWhere.user = {
        name: { contains: search, mode: "insensitive" },
      };
    } else if (isNumericSearch) {
      baseWhere.user = {
        contactNo: { contains: search },
      };
    }
  }

  // Get records, count, and summary stats in parallel
  const [records, totalCount, summaryData] = await Promise.all([
    prisma.payment.findMany({
      skip: offset,
      take: limit,
      where: baseWhere,
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
            contactNo: true,
          },
        },
      },
    }),

    prisma.payment.count({
      where: baseWhere,
    }),

    // Summary by payment status
    prisma.payment.groupBy({
      by: ["paymentStatus"],
      where: baseWhere,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Format records with BigInt conversion and IST dates
  const formattedRecords = records.map((record: any) => ({
    ...record,
    id: String(record.id),
    userId: record.userId ? String(record.userId) : null,
    referred_user_id: record.referred_user_id ? String(record.referred_user_id) : null,
    amount: Number(record.amount || 0),
    cashback_amount: record.cashback_amount ? Number(record.cashback_amount) : null,
    created_at: formatToIST(record.created_at),
    updated_at: formatToIST(record.updated_at),
    user: record.user
      ? {
          ...record.user,
          id: String(record.user.id),
        }
      : null,
  }));

  // Process summary data by payment status
  const summary = summaryData.reduce(
    (acc: {
      successAmount: number;
      successCount: number;
      pendingAmount: number;
      pendingCount: number;
      failedAmount: number;
      failedCount: number;
      totalAmount: number;
      totalCount: number;
    }, item: any) => {
      const status = (item.paymentStatus || "unknown").toLowerCase();
      const amount = Number(item._sum.amount || 0);
      const count = item._count.id;

      if (status === "success") {
        acc.successAmount = amount;
        acc.successCount = count;
      } else if (status === "pending") {
        acc.pendingAmount = amount;
        acc.pendingCount = count;
      } else if (status === "failed") {
        acc.failedAmount = amount;
        acc.failedCount = count;
      }

      acc.totalAmount += amount;
      acc.totalCount += count;

      return acc;
    },
    {
      successAmount: 0,
      successCount: 0,
      pendingAmount: 0,
      pendingCount: 0,
      failedAmount: 0,
      failedCount: 0,
      totalAmount: 0,
      totalCount: 0,
    }
  );

  return {
    records: formattedRecords,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    summary,
  };
}

// Helper function to export all wallet transactions (for CSV/Excel export)
export async function getAllWalletTransactions({
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
    ...getISTDateBoundaries(startDate, endDate),
  };

  if (search) {
    if (isAlphaSearch) {
      baseWhere.user = {
        name: { contains: search, mode: "insensitive" },
      };
    } else if (isNumericSearch) {
      baseWhere.user = {
        contactNo: { contains: search },
      };
    }
  }

  const records = await prisma.wallettransaction.findMany({
    where: baseWhere,
    orderBy: { id: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          contactNo: true,
        },
      },
      astrologer: {
        select: {
          id: true,
          name: true,
        },
      },
      ai_astrologer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return records.map((record: any) => ({
    ...record,
    id: String(record.id),
    userId: record.userId ? String(record.userId) : null,
    astrologerId: record.astrologerId ? String(record.astrologerId) : null,
    aiAstrologerId: record.aiAstrologerId ? String(record.aiAstrologerId) : null,
    amount: Number(record.amount || 0),
    created_at: formatToIST(record.created_at),
    user: record.user
      ? {
          ...record.user,
          id: String(record.user.id),
        }
      : null,
    astrologer: record.astrologer
      ? {
          ...record.astrologer,
          id: String(record.astrologer.id),
        }
      : null,
    ai_astrologer: record.ai_astrologer
      ? {
          ...record.ai_astrologer,
          id: String(record.ai_astrologer.id),
        }
      : null,
  }));
}

// Helper function to export all payment transactions (for CSV/Excel export)
export async function getAllPaymentTransactions({
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
    ...getISTDateBoundaries(startDate, endDate),
  };

  if (search) {
    if (isAlphaSearch) {
      baseWhere.user = {
        name: { contains: search, mode: "insensitive" },
      };
    } else if (isNumericSearch) {
      baseWhere.user = {
        contactNo: { contains: search },
      };
    }
  }

  const records = await prisma.payment.findMany({
    where: baseWhere,
    orderBy: { id: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          contactNo: true,
        },
      },
    },
  });

  return records.map((record: any) => ({
    ...record,
    id: String(record.id),
    userId: record.userId ? String(record.userId) : null,
    amount: Number(record.amount || 0),
    cashback_amount: record.cashback_amount ? Number(record.cashback_amount) : null,
    created_at: formatToIST(record.created_at),
    user: record.user
      ? {
          ...record.user,
          id: String(record.user.id),
        }
      : null,
  }));
}

// Get wallet transaction by ID
export async function getWalletTransactionById(id: string | number) {
  const transaction = await prisma.wallettransaction.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          contactNo: true,
          profile: true,
        },
      },
      astrologer: {
        select: {
          id: true,
          name: true,
          contactNo: true,
          profileImage: true,
        },
      },
      ai_astrologer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      order_request: {
        select: {
          id: true,
          orderType: true,
          totalMin: true,
          payableAmount: true,
        },
      },
    },
  });

  if (!transaction) return null;

  return {
    ...transaction,
    id: String(transaction.id),
    userId: transaction.userId ? String(transaction.userId) : null,
    astrologerId: transaction.astrologerId ? String(transaction.astrologerId) : null,
    aiAstrologerId: transaction.aiAstrologerId ? String(transaction.aiAstrologerId) : null,
    orderId: transaction.orderId ? String(transaction.orderId) : null,
    amount: Number(transaction.amount || 0),
    created_at: formatToIST(transaction.created_at),
    updated_at: formatToIST(transaction.updated_at),
    user: transaction.user
      ? {
          ...transaction.user,
          id: String(transaction.user.id),
        }
      : null,
    astrologer: transaction.astrologer
      ? {
          ...transaction.astrologer,
          id: String(transaction.astrologer.id),
        }
      : null,
    ai_astrologer: transaction.ai_astrologer
      ? {
          ...transaction.ai_astrologer,
          id: String(transaction.ai_astrologer.id),
        }
      : null,
    order_request: transaction.order_request
      ? {
          ...transaction.order_request,
          id: String(transaction.order_request.id),
          payableAmount: transaction.order_request.payableAmount
            ? String(transaction.order_request.payableAmount)
            : null,
        }
      : null,
  };
}

// Get payment transaction by ID
export async function getPaymentTransactionById(id: string | number) {
  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          contactNo: true,
          profile: true,
          email: true,
        },
      },
    },
  });

  if (!payment) return null;

  return {
    ...payment,
    id: String(payment.id),
    userId: payment.userId ? String(payment.userId) : null,
    referred_user_id: payment.referred_user_id ? String(payment.referred_user_id) : null,
    amount: Number(payment.amount || 0),
    cashback_amount: payment.cashback_amount ? Number(payment.cashback_amount) : null,
    created_at: formatToIST(payment.created_at),
    updated_at: formatToIST(payment.updated_at),
    user: payment.user
      ? {
          ...payment.user,
          id: String(payment.user.id),
        }
      : null,
  };
}