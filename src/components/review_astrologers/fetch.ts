"use server";
import prisma from "../../prismaClient"; // import sahi tarike se

// --------------------
// Get Reviews
// --------------------
export async function getReviews({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const offset = (page - 1) * limit;

  // base condition
  const where: any = {
    astrologerId: { not: null },
    isDelete: false,
  };

  // 🔍 Search conditions
  if (search) {
    if (isNumericSearch) {
      where.OR = [
        { user: { contactNo: { contains: search } } },
        { astrologer: { contactNo: { contains: search } } },
      ];
    } else if (isAlphaSearch) {
      where.OR = [
        { user: { name: { contains: search } } },
        { astrologer: { name: { contains: search } } },
      ];
    }
  }

  // ✅ Fetch reviews & count
  const [reviews, totalCount] = await Promise.all([
    prisma.user_reviews.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
      include: {
        user: {
          select: { name: true, profile: true, contactNo: true },
        },
        astrologer: {
          select: { name: true, contactNo: true },
        },
      },
    }),

    prisma.user_reviews.count({ where }),
  ]);

  return {
    reviews: reviews.map((r: any) => ({
      id: r.id,
      review: r.review,
      created_at: r.created_at?.toISOString() || "",
      userName: r.user?.name || "user",
      userProfile: r.user?.profile || null,
      userContactNo: r.user?.contactNo || "-",
      astrologerName: r.astrologer?.name || "-",
      astrologerContactNo: r.astrologer?.contactNo || "-",
    })),
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// --------------------
// Delete Review
// --------------------
export async function deleteReview(id: number) {
  try {
    const deleted = await prisma.user_reviews.update({
      where: { id: BigInt(id) }, // ✅ agar `id` bigint hai
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });

    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("Error deleting Review:", error);
    return { success: false, message: "Failed to delete review" };
  }
}
