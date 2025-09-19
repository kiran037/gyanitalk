"use server"
const prisma = require("../../prismaClient");

// Get Withdraw Methods
export async function getWithdrawalMethods() {

  const methods = await prisma.withdrawmethods.findMany({
    orderBy: { id: "desc" },
  });
  
return {
    methods : methods.map((t: any) => ({
      ...t,
      id: t.id,
      created_at: t.created_at ? t.created_at.toISOString() : null,
      updated_at: t.updated_at? t.updated_at.toISOString() : null,
    })),
  };
}

// ✅ Update  Withdraw Methods
export async function editWithdrawalMethods(
  id: number,
  payload: {
    method_name: string;
  }
) {
  try {
    const updated = await prisma.withdrawmethods.update({
      where: { id: Number(id) },
      data: {
        method_name: payload.method_name,
        updated_at: new Date(),
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Update Withdraw Method Error:", error);
    return { success: false, message: "Failed to update withdraw method" };
  }
}

// Toggle Active/Inactive withdraw methods status
export async function updateWithdrawMethodsStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.withdrawmethods.update({
      where: { id: Number(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateWithdrawMethodsStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}
