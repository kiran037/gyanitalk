"use server"
const prisma = require("../../prismaClient");

// Get Wallet History
export async function getWalletHistory({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const offset = (page - 1) * limit;

  // ✅ Base filter (success ya failed status)
  const baseWhere: any = {
    OR: [{ paymentStatus: "success" }, { paymentStatus: "failed" }],
  };

  // 🔍 Search filter
  if (search) {
    const isNumericSearch = /^\d+$/.test(search);
    baseWhere.user = isNumericSearch
      ? { contactNo: { contains: search } }
      : { name: { contains: search } };
  }

  const [walletHistory, totalCount] = await Promise.all([
    prisma.payment.findMany({
      skip: offset,
      take: limit,
      where: baseWhere,
      include: {
        user: {
          select: {
            name: true,
            profile: true,
            contactNo: true,
          },
        },
      },
      orderBy: { id: "desc" },
    }),
    prisma.payment.count({
      where: baseWhere, // ✅ count me bhi same filter
    }),
  ]); 
  
  return {
  wallethistory: walletHistory.map((w: any) => ({
    id: w.id,
    amount: w.amount || 0,
    created_at: w.created_at?.toISOString() || "",
    paymentMode: w.paymentMode || "",
    paymentStatus: w.paymentStatus || "",
    name: w.user?.name || "-",
    profile: w.user?.profile || null,
    contactNo: w.user?.contactNo || "-",
    })),
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}
