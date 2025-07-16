const prisma = require("../../prismaClient");

export async function getAstrologers({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "id",
  sortOrder = "desc",
  isVerified,
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  isVerified?: string;
}) {
  const offset = (page - 1) * limit;

  const whereClause = {
    isDelete: false,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { contactNo: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(isVerified === "true" && { isVerified: true }),
    ...(isVerified === "false" && { isVerified: false }),
  };

  // Default sort fallback
  const safeSortBy = ["chatStatus", "callStatus", "isVerified", "id"].includes(sortBy)
    ? sortBy
    : "id";

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