"use server"
const prisma = require("../../prismaClient");

export async function getCoupons() {
  const recordsRaw = await prisma.coupons.findMany({
    orderBy: { id: "desc" },
  });

  const records = recordsRaw.map((coupons: any) => ({
    ...coupons,
    discount_value: String(coupons.discount_value),
    max_discount: String(coupons.max_discount),
    min_order_amount: String(coupons.min_order_amount),
  }));

  return { records };
}