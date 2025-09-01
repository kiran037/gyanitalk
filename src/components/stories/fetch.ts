"use server"
const prisma = require("../../prismaClient");

export async function getStories(
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
  
    const [astrologer_stories, totalCount] = await Promise.all([
      prisma.astrologer_stories.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where: baseWhere,
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            contactNo: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            story_view_count: true, // 👈 fetch view counts
          },
        }
      },
    }),
    prisma.astrologer_stories.count({
      where: baseWhere,
    }),
  ]);

   // ✅ Format
    // ✅ Always show StoryViewCount (default 0 if no views)
    const data = astrologer_stories.map((c: any) => ({
      ...c,
      created_at: c.created_at ? c.created_at.toISOString() : null,
      StoryViewCount: c._count?.story_view_count ?? 0, // ensure 0 if no views
    }));

  // ✅ Collect all userIds from reviews
    const astrologerIds = data.map((item: any) => item.astrologerId).filter(Boolean);

  // ✅ Fetch astrologers in one query
    const astrologers = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: {
        id: true,
        name: true,
        contactNo: true,
        profileImage: true,
      },
    });

    return {
    data,
    astrologers,
    total: totalCount, // uncomment if you add count query
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function deleteStories(id: number) {
  try {
    const deletedCoupon = await prisma.astrologer_stories.delete({
      where: { id: id },
    });

  } catch (error) {
    console.error("Failed to delete story:", error);
    throw new Error("Unable to delete story.");
  }
}