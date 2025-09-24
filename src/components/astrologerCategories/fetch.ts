"use server"
const prisma = require("../../prismaClient");

// Get Astrologer Category
export async function getAstrologerCategories({
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
  // 👇 where condition properly build karo
  const where: any = {
    isDelete: false,
  };
  
  if (search) {
    if (isAlphaSearch) {
      // text search → name
      where.name = { contains: search };
    }
  }

 const [astrologer_categories, totalCount] = await Promise.all([
    prisma.astrologer_categories.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
    }),
    prisma.astrologer_categories.count({
      where, 
    }),
  ]);
    
  return {
    astrologer_categories: astrologer_categories.map((g: any) => ({
      id: g.id,
      name: g.name,
      image: g.image,
      amount: g.amount || 0,
      isActive: g.isActive,
      created_at: g.created_at?.toISOString() || "",
    })),
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// Delete Astrologer Category
export async function deleteAstrologerCategory(id: number) {
  try {
    const deleted = await prisma.astrologer_categories.delete({
      where: { id: BigInt(id) },
    });

    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("Error deleting Category:", error);
    return { success: false, message: "Failed to delete category" };
  }
}

// Edit Astrologer Category
export async function updateAstrologerCategory(id: number, data: any) {
  try {
    const updatedCategories = await prisma.astrologer_categories.update({
      where: { id },
      data,
    });

    return { success: true, course: updatedCategories };
  } catch (error: any) {
    console.error("Error updating Astrologer Category:", error);
    return { success: false, message: error.message };
  }
}

// Add Astrologer Category
export async function createAstrologerCategory(data: any) {
  try {
    const astrologerCategory = await prisma.astrologer_categories.create({
      data: {
        name: data.name,
        image: data.image || null,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: data.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: data.modifiedBy ?? 1, // 👈 adjust with session user
      },
    });

    return { success: true, astrologerCategory };
  } catch (error: any) {
    console.error("Error creating Astrologer Category:", error);
    return { success: false, message: error.message };
  }
}

// Toggle Active/Inactive Astrologer Category
export async function updateCategoriesStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.astrologer_categories.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateCategoriesStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}
