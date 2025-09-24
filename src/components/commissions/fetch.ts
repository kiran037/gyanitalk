"use server"
const prisma = require("../../prismaClient");

// Get Commissions
export async function getCommissions({ page = 1, limit = 15, astrologerId }: any) {
  const offset = (page - 1) * limit;
  const where: any = {};
  if (astrologerId) where.astrologerId = astrologerId;

  const [commissions, totalCount] = await Promise.all([
    prisma.commissions.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where,
      include: {
        astrologer: { select: { name: true, contactNo: true } },
        commissionType: { select: { name: true } },
      },
    }),
    prisma.commissions.count({ where }),
  ]);

  const commissionTypes = await prisma.commission_types.findMany({ orderBy: { name: "asc" } });
  const astrologers = await prisma.astrologers.findMany({
    where: { isActive: true, isDelete: false, isVerified: true },
    orderBy: { name: "asc" },
  });

  return {
    commissions: commissions.map((c: any) => ({
      id: c.id,
      astrologerId: c.astrologerId,
      astrologerName: c.astrologer?.name || "N/A",   // safe
      commissionTypeId: c.commissionTypeId,
      commissionType: c.commissionType?.name || "N/A", // safe
      commission: c.commission,
    })),
    commissionTypes,
    astrologers,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// Edit Commission
export async function updateCommission(id: number, data: any) {
  try {
    const updatedCommission = await prisma.commissions.update({
      where: { id },
      data: {
        astrologerId: data.astrologerId,
        commissionTypeId: data.commissionTypeId,
        commission: data.commission,
      },
    });
    return { success: true, commission: updatedCommission };
  } catch (error: any) {
    console.error("Error updating Commission:", error);
    return { success: false, message: error.message };
  }
}

// Add Commission
export async function createCommission(data: any) {
  try {
    const createcommission = await prisma.commissions.create({
      data: {
        astrologerId: data.astrologerId,
        commissionTypeId: data.commissionTypeId,
        commission: data.commission,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: data.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: data.modifiedBy ?? 1, // 👈 adjust with session user
      },
    });
    return { success: true, commission: createcommission };
  } catch (error: any) {
    console.error("Error creating Commission:", error);
    return { success: false, message: error.message };
  }
}
