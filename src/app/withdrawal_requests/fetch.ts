"use server"
const prisma = require("../../prismaClient");

// Get Withdraw Request
export async function getWithdrawalRequests({
  page = 1,
  limit = 15,
  search = "",
  status = "",
  startDate ="",
  endDate ="",

}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;

}) {
  const offset = (page - 1) * limit;

// ✅ build where condition dynamically
  const where: any = {};

  // 🔍 Search filter
  if (search) {
    const isNumericSearch = /^\d+$/.test(search);
    if (isNumericSearch) {
      where.astrologer = { contactNo: { contains: search } };
    } else {
      where.astrologer = { name: { contains: search } };
    }
  }

  // 📌 Status filter
  if (status) {
    where.status = status;
  }

  // 📅 Date filter
  if (startDate && endDate) {
    where.created_at = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    where.created_at = {
      gte: new Date(startDate),
    };
  } else if (endDate) {
    where.created_at = {
      lte: new Date(endDate),
    };
  }

  const [withdrawlRequests, totalCount] = await Promise.all([
    prisma.withdrawrequest.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where, 
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            contactNo: true,
            profileImage: true,
            userId: true,
          },
        },
        withdrawmethod: {
          select: {
            id: true,
            method_name: true,
            method_id: true,
          },
        },
      },
    }),
    prisma.withdrawrequest.count({ where }),
  ]); 
  
return {
    withdrawlRequests: withdrawlRequests.map((t: any) => ({
      ...t,
      id: t.id,
      withdrawAmount: t.withdrawAmount ? Number(t.withdrawAmount) : 0, // 👈 Decimal fix
      profileImage: t.astrologer?.profileImage || "",
      name: t.astrologer?.name || "",
      contactNo: t.astrologer?.contactNo || "",
      method_id: t.withdrawmethod?.id || 0,
      method_name: t.withdrawmethod?.method_name || "",
      created_at: t.created_at ? t.created_at.toISOString() : null,
      updated_at: t.updated_at? t.updated_at.toISOString() : null,
    })),
    totalPages: Math.ceil(totalCount / limit), // ✅ pagination
    currentPage: page,
  };
}

// Withdraw Request status updated released
export async function releaseWithdrawal(id: number) {
  try {
    const updated = await prisma.withdrawrequest.update({
      where: { id },
      data: { status: "Released" },
    });
    return { success: true, data: updated };
  } catch (error) {
    console.error("Release Error:", error);
    return { success: false, error: "Failed to release request" };
  }
}

// Withdraw Request status updated reject
export async function rejectWithdrawal(id: number) {
  try {
    const updated = await prisma.withdrawrequest.update({
      where: { id },
      data: { status: "Reject" },
    });
    return { success: true, data: updated };
  } catch (error) {
    console.error("Reject Error:", error);
    return { success: false, error: "Failed to reject request" };
  }
}
