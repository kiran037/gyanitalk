"use server"
const prisma = require("@/prismaClient");

export async function getAiAstro({
  page = 1,
  limit = 15,
  search = "",
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
    ...(search &&
      isAlphaSearch && {
      name: { contains: search },
    }),
    ...(search &&
      isNumericSearch && {
      contactNo: { contains: search },
    }),
  };

  const [astrologers, totalCount] = await Promise.all([
    prisma.aiastrologers.findMany({
      skip: offset,
      take: limit,
      where: whereClause,
    }),

    prisma.aiastrologers.count({ where: whereClause }),
  ]);

  const astrologersWithStats = await Promise.all(
    astrologers.map(async (astro: any) => {
      const [totalChat] = await Promise.all([
        prisma.ai_chat_histories.count({ where: { ai_astrologer_id: astro.id } }),
      ]);

      return {
        ...astro,
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


export async function updateFeaturedStatus({ id, featured }: UpdateLiveStatusProps) {

  const updated = await prisma.aiastrologers.update({
    where: { id },
    data: { featured },
  });



}

export async function updateVerifyStatus({ id, isVerified }: UpdateVerifiedStatusProps) {

  const updated = await prisma.astrologers.update({
    where: { id },
    data: { isVerified: !isVerified },
  });

}


export async function getAiProfileDetails({ id }: { id?: any }) {
  const astroDetail = await prisma.aiastrologers.findFirst({
    where: { id: Number(id) },
  });

  const chatHistory = await prisma.ai_chat_histories.findMany({
    where: {
      ai_astrologer_id: Number(id),
    },
    orderBy: {
      id: 'desc',
    },
    include: {
      aiastrologer: true
    },
  });

  const totalChatMinutes = chatHistory.reduce((sum: number, req: any) => {
    const min = Number(req.totalMin) || 0;
    return sum + min;
  }, 0);


  const skills = await prisma.skills.findMany();
  const categories = await prisma.astrologer_categories.findMany();

  return {
    astroDetail,
    chatHistory,
    totalChatMinutes,
    skills,
    categories
  };
}

export async function updateAiProfile(id: any, data: any) {

}



type UpdateLiveStatusProps = {
  id: number;
  featured: 0 | 1;
};
type UpdateVerifiedStatusProps = {
  id: number;
  isVerified: boolean;
};