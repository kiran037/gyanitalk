// src/lib/profile/wallet.ts
import { prisma } from "@/lib/prisma";

/**
 * Get wallet balance and recent transactions
 */
export async function getWalletInfo(userId: bigint) {
  const wallet = await prisma.user_wallets.findFirst({
    where: { userId, isActive: true, isDelete: false },
    select: { amount: true },
  });

  const recentTransactions = await prisma.wallettransaction.findMany({
    where: { userId },
    take: 10,
    orderBy: { created_at: "desc" },
    include: {
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
    },
  });

  const [totalCredited, totalDebited] = await Promise.all([
    prisma.wallettransaction.aggregate({
      where: { userId, isCredit: true },
      _sum: { amount: true },
    }),
    prisma.wallettransaction.aggregate({
      where: { userId, isCredit: false },
      _sum: { amount: true },
    }),
  ]);

  return {
    balance: wallet?.amount || 0,
    recent_transactions: recentTransactions,
    total_credited: totalCredited._sum.amount || 0,
    total_debited: totalDebited._sum.amount || 0,
  };
}

/**
 * Get wallet transactions with pagination
 */
export async function getWalletTransactions(
  userId: bigint,
  filters: {
    type?: "credit" | "debit";
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    searchQuery?: string;
  } = {}
) {
  const { type, startDate, endDate, page = 1, limit = 20, searchQuery } = filters;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (type === "credit") where.isCredit = true;
  if (type === "debit") where.isCredit = false;

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at.gte = startDate;
    if (endDate) where.created_at.lte = endDate;
  }

  if (searchQuery) {
    where.transaction_id = { contains: searchQuery };
  }

  const [transactions, total] = await Promise.all([
    prisma.wallettransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
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
            orderStatus: true,
          },
        },
      },
    }),
    prisma.wallettransaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get wallet statistics
 */
export async function getWalletStatistics(userId: bigint) {
  const [totalTransactions, creditCount, debitCount, avgTransaction] = await Promise.all([
    prisma.wallettransaction.count({ where: { userId } }),
    prisma.wallettransaction.count({ where: { userId, isCredit: true } }),
    prisma.wallettransaction.count({ where: { userId, isCredit: false } }),
    prisma.wallettransaction.aggregate({
      where: { userId },
      _avg: { amount: true },
    }),
  ]);

  return {
    total_transactions: totalTransactions,
    credit_count: creditCount,
    debit_count: debitCount,
    avg_transaction: avgTransaction._avg.amount || 0,
  };
}