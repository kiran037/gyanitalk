// src/lib/profile/history.ts
import { prisma } from "@/lib/prisma";

export interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  astrologerId?: bigint;
  page?: number;
  limit?: number;
}

/**
 * Get call history with astrologers
 */
export async function getCallHistory(userId: bigint, filters: HistoryFilters = {}) {
  const { startDate, endDate, astrologerId, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (astrologerId) where.astrologerId = astrologerId;
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at.gte = startDate;
    if (endDate) where.created_at.lte = endDate;
  }

  const [calls, total] = await Promise.all([
    prisma.callrequest.findMany({
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
            primarySkill: true,
          },
        },
      },
    }),
    prisma.callrequest.count({ where }),
  ]);

  return {
    calls,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get chat history with astrologers
 */
export async function getChatHistory(userId: bigint, filters: HistoryFilters = {}) {
  const { startDate, endDate, astrologerId, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (astrologerId) where.astrologerId = astrologerId;
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at.gte = startDate;
    if (endDate) where.created_at.lte = endDate;
  }

  const [chats, total] = await Promise.all([
    prisma.chatrequest.findMany({
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
            primarySkill: true,
          },
        },
      },
    }),
    prisma.chatrequest.count({ where }),
  ]);

  return {
    chats,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get communication statistics
 */
export async function getCommunicationStats(userId: bigint) {
  const [totalCalls, totalChats, callSpent, chatSpent] = await Promise.all([
    prisma.callrequest.count({ where: { userId } }),
    prisma.chatrequest.count({ where: { userId } }),

    prisma.callrequest.aggregate({
      where: { userId },
      _sum: { deduction: true },
    }),

    prisma.chatrequest.aggregate({
      where: { userId },
      _sum: { deduction: true },
    }),
  ]);

  return {
    total_calls: totalCalls,
    total_chats: totalChats,

    // totalMin is STRING in DB → cannot be aggregated
    total_call_minutes: null,
    total_chat_minutes: null,

    total_spent:
      (callSpent._sum.deduction ?? 0) +
      (chatSpent._sum.deduction ?? 0),
  };
}

/**
 * Get most contacted astrologers
 */
export async function getMostContactedAstrologers(userId: bigint, limit: number = 5) {
  const callCounts = await prisma.callrequest.groupBy({
    by: ["astrologerId"],
    where: { userId, astrologerId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const astrologerIds = callCounts.map((c) => c.astrologerId).filter((id): id is bigint => id !== null);

  const astrologers = await prisma.astrologers.findMany({
    where: { id: { in: astrologerIds } },
    select: {
      id: true,
      name: true,
      profileImage: true,
      primarySkill: true,
    },
  });

  return callCounts.map((count) => {
    const astrologer = astrologers.find((a) => a.id === count.astrologerId);
    return {
      astrologer,
      call_count: count._count.id,
    };
  });
}