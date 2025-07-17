"use server"
const prisma = require("../../prismaClient");

export async function getAstrologers({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "id",
  sortOrder = "desc",
  isVerifiedKey,
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  isVerifiedKey?: string;
}) {
  const offset = (page - 1) * limit;
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);
  const whereClause = {
    isDelete: false,
    ...(search &&
      isAlphaSearch && {
      name: { contains: search },
    }),
    ...(search &&
      isNumericSearch && {
      contactNo: { contains: search },
    }),
    ...(isVerifiedKey === "true" && { isVerified: true }),
    ...(isVerifiedKey === "false" && { isVerified: false }),
  };

  const shouldSort =
    sortBy && (sortOrder === "asc" || sortOrder === "desc");


  const [astrologers, totalCount] = await Promise.all([
    prisma.astrologers.findMany({
      skip: offset,
      take: limit,
      ...(shouldSort && {
        orderBy: { [sortBy]: sortOrder },
      }),
      where: whereClause,
    }),

    prisma.astrologers.count({ where: whereClause }),
  ]);

  const astrologersWithStats = await Promise.all(
    astrologers.map(async (astro: any) => {
      const [reviews, totalCall, totalChat] = await Promise.all([
        prisma.user_reviews.findMany({
          where: { astrologerId: astro.id },
          select: { rating: true },
        }),
        prisma.callrequest.count({ where: { astrologerId: astro.id } }),
        prisma.chatrequest.count({ where: { astrologerId: astro.id } }),
      ]);

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: any, r: any) => sum + r.rating, 0) / reviews.length
        : null;

      return {
        ...astro,
        rating: avgRating,
        totalCallRequest: totalCall,
        totalChatRequest: totalChat,
      };
    })
  );

  return {
    astrologers: astrologersWithStats,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}


export async function updateLiveStatus({ id, isLiveOff }: UpdateLiveStatusProps) {
  const updated = await prisma.astrologers.update({
    where: { id },
    data: { isLiveOff },
  });

}

export async function updateVerifyStatus({ id, isVerified }: UpdateVerifiedStatusProps) {

  const updated = await prisma.astrologers.update({
    where: { id },
    data: { isVerified: !isVerified },
  });

}


export async function getProfileDetails({ id }: { id?: any }) {
  const astroDetail = await prisma.astrologers.findFirst({
    where: { id: Number(id) },
  });

  const callHistory = await prisma.callrequest.findMany({
    where: {
      astrologerId: Number(id),
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
        },
      },
    },
  });


  const chatHistory = await prisma.chatrequest.findMany({
    where: {
      astrologerId: Number(id),
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
        },
      },
    },
  });

  const walletTransactions = await prisma.wallettransaction.findMany({
    where: { userId: Number(id) },
  });

  const followersCount = await prisma.astrologer_followers.count({
    where: { astrologerId: Number(id) },
  });

  const astroAvailability = await prisma.astrologer_availabilities.findMany({
    where: { astrologerId: Number(id) },
  });


  const totalCallMinutes = callHistory.reduce((sum: number, req: any) => {
    const min = Number(req.totalMin) || 0;
    return sum + min;
  }, 0);

  const totalChatMinutes = chatHistory.reduce((sum: number, req: any) => {
    const min = Number(req.totalMin) || 0;
    return sum + min;
  }, 0);


  return {
    astroDetail,
    callHistory,
    chatHistory,
    walletTransactions,
    totalCallMinutes,
    totalChatMinutes,
    followersCount,
    astroAvailability
  };
}







type UpdateLiveStatusProps = {
  id: number;
  isLiveOff: 0 | 1;
};
type UpdateVerifiedStatusProps = {
  id: number;
  isVerified: boolean;
};