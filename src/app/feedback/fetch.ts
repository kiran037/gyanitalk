"use server"
const prisma = require("../../prismaClient");

export async function getFeedbacks(
  {
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

    ...(search &&
      isAlphaSearch && {
      name: { contains: search },
    }),
    ...(search &&
      isNumericSearch && {
      contactNo: { contains: search },
    }),
  };
  
  const [app_reviews, totalCount] = await Promise.all([
    prisma.app_reviews.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where: baseWhere,
          include: {
            users: {   // 👈 relation name in schema (check your `schema.prisma`)
              select: {
                id: true,
                name: true,
                contactNo: true,
                profile: true,
              },
            },
          },
    }),
     prisma.app_reviews.count({ where: baseWhere }),
  ]);

  // ✅ Now each review already has its user data
  const data = app_reviews.map((c: any) => ({
    ...c,
    created_at: c.created_at ? c.created_at.toISOString() : null,
  }));
  // ✅ Collect all userIds from reviews
    const userIds = data.map((item: any) => item.userId).filter(Boolean);

  // ✅ Fetch users in one query
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        contactNo: true,
        profile: true,
      },
    });

  return {
    data,
    users,
    total: totalCount, // uncomment if you add count query
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}
