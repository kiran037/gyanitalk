"use server"
const prisma = require("../../prismaClient");

// Get Block Astrologer
export async function getBlockAstrologer({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const offset = (page - 1) * limit;

 // ✅ base where condition
  const where: any = {
    astrologerId: {
      not: null,   // ✅ correct way for non-null
    },
  };

  // 🔍 Search filter
  if (search) {
    const isNumericSearch = /^\d+$/.test(search);

    where.user = isNumericSearch
      ? { contactNo: { contains: search } }
      : { name: { contains: search } };
  }

  // ✅ parallel queries (data + count)
  const [reviews, totalCount] = await Promise.all([
    prisma.blockastrologer.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
      include: {
        user: {
          select: {
            name: true,
            profile: true,
            contactNo: true,
          },
        },
        astrologer: {
          select: {
            name: true,
            contactNo: true,
          },
        },
      },
    }),
    prisma.blockastrologer.count({ where }),
  ]);  

  // 👉 flat structure
  return {
    reviews: reviews.map((r: any) => ({
      ...r,
      userName: r.user?.name,
      profile: r.user?.profile,
      contactNo: r.user?.contactNo,
      astrologerName: r.astrologer?.name,
      astrologerContactNo: r.astrologer?.contactNo,
    })),
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}
