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


export async function getCouponDetails(id: any) {
  const recordsRaw = await prisma.coupons.findFirst({
    where: { id },
    orderBy: { id: "desc" },
  });

  const cDetails = {
    ...recordsRaw,
    discount_value: String(recordsRaw.discount_value),
    max_discount: String(recordsRaw.max_discount),
    min_order_amount: String(recordsRaw.min_order_amount),
  };

  return { cDetails };
}


export async function updateCouponDetails(data: any, couponId: number) {
  const updatedCoupon = await prisma.coupons.update({
    where: { id: couponId },
    data: {
      code: data.code,
      description: data.description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_discount: data.max_discount,
      min_order_amount: data.min_order_amount,
      usage_limit: data.usage_limit,
      usage_limit_per_user: data.usage_limit_per_user,
      start_date: data.start_date ? new Date(data.start_date) : null,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
      type: data.type,
      is_active: data.is_active,
      updated_at: new Date(),
    },
  });
}


export async function createCouponDetails(data: any) {
  const newCoupon = await prisma.coupons.create({
    data: {
      code: data.code,
      description: data.description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_discount: data.max_discount,
      min_order_amount: data.min_order_amount,
      usage_limit: data.usage_limit,
      usage_limit_per_user: data.usage_limit_per_user,
      start_date: data.start_date ? new Date(data.start_date) : null,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
      type: data.type,
      is_active: data.is_active,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });


  const couponData = {
    ...newCoupon,
    discount_value: String(newCoupon.discount_value),
    max_discount: String(newCoupon.max_discount),
    min_order_amount: String(newCoupon.min_order_amount),
  };

  return couponData;
}




export async function deleteCoupon(couponId: number) {
  try {
    const deletedCoupon = await prisma.coupons.delete({
      where: { id: couponId },
    });

  } catch (error) {
    console.error("Failed to delete coupon:", error);
    throw new Error("Unable to delete coupon.");
  }
}

