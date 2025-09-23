"use server"
const prisma = require("../../prismaClient");

// Get Gifts
export async function getGifts({
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
    isActive: true,
    isDelete: false,
  };

  if (search) {
    if (isNumericSearch) {
      where.amount = Number(search);
    } else if (isAlphaSearch) {
      // text search → name
      where.name = { contains: search };
    }
  }

 const [gifts, totalCount] = await Promise.all([
    prisma.gifts.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
    }),
    prisma.gifts.count({
      where, 
    }),
  ]);
    
  return {
    gifts: gifts.map((g: any) => ({
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

// Delete Gift
export async function deleteGift(id: number) {
  try {
    const deleted = await prisma.gifts.delete({
      where: { id: BigInt(id) },
    });

    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("Error deleting Gift:", error);
    return { success: false, message: "Failed to delete gift" };
  }
}

// Edit Gift
export async function updateGift(id: number, data: any) {
  try {
    const updatedGift = await prisma.gifts.update({
      where: { id },
      data,
    });

    return { success: true, course: updatedGift };
  } catch (error: any) {
    console.error("Error updating Gift:", error);
    return { success: false, message: error.message };
  }
}

// Add Gift
export async function createGift(data: any) {
  try {
    const gifts = await prisma.gifts.create({
      data: {
        name: data.name,
        image: data.image || null,
        amount: Number(data.amount),
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: data.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: data.modifiedBy ?? 1, // 👈 adjust with session user
      },
    });

    return { success: true, gifts };
  } catch (error: any) {
    console.error("Error creating Gift:", error);
    return { success: false, message: error.message };
  }
}

// Toggle Active/Inactive gifts
export async function updateGiftStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.gifts.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateGiftStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}
