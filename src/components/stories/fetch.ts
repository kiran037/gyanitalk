"use server"
const prisma = require("../../prismaClient");

export async function getStories({
  page = 1,
  limit = 15,
  search = "",
  startDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
}) {
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);


  let dateFilter: any = {};
  if (!startDate) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    dateFilter = {
      gte: yesterday,
      lte: now,
    };
  } else {
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
  }



  const baseWhere: any = {
    created_at: dateFilter,
    ...(search && {
      astrologer: {
        ...(isAlphaSearch && { name: { contains: search } }),
        ...(isNumericSearch && { contactNo: { contains: search } }),
      },
    }),
  };

  const [astrologer_stories, totalCount] = await Promise.all([
    prisma.astrologer_stories.findMany({
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
          select: { story_view_count: true },
        },
      },
    }),
    prisma.astrologer_stories.count({ where: baseWhere }),
  ]);

  const data = astrologer_stories.map((c: any) => ({
    ...c,
    created_at: c.created_at ? c.created_at.toISOString() : null,
    StoryViewCount: c._count?.story_view_count ?? 0,
  }));

  const astrologers = data
    .map((d: any) => d.astrologer)
    .filter(Boolean);

  return {
    data,
    astrologers,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function deleteStories(id: number) {
  try {
    const deletedCoupon = await prisma.astrologer_stories.delete({
      where: { id: id },
    });

    return {status: true, message: "Story deleted successfully", data: deletedCoupon};

  } catch (error) {
    return {status: false, message: "Error deleting story"};
  }
}