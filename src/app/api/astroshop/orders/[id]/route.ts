import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (
    typeof obj === 'object' &&
    (obj as any).constructor &&
    (obj as any).constructor.name === 'Decimal'
  ) {
    const asNum = Number((obj as any).toString());
    return Number.isFinite(asNum) ? asNum : 0;
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

// GET - Get single order with complete details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = (await params) as { id: string };
    const id = BigInt(idStr);

    const order = await prisma.order_request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            countryCode: true,
            birthDate: true,
            gender: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            productImage: true,
            // Don't select amount - use order's totalPayable
            features: true,
          },
        },
        product_category: {
          select: {
            id: true,
            name: true,
            categoryImage: true,
          },
        },
        order_address: true,
        coupon_user_usages: {
          include: {
            coupons: {
              select: {
                code: true,
                discount_type: true,
                discount_value: true,
              },
            },
          },
        },
      },
    });

    // In the GET function, after fetching the order, add this normalization:

if (!order) {
  return NextResponse.json(
    { success: false, error: 'Order not found' },
    { status: 404 }
  );
}

// Only generate for product orders
if (!order.productId) {
  return NextResponse.json(
    { success: false, error: 'Not a product order' },
    { status: 400 }
  );
}

// ✅ ADD THIS NORMALIZATION BEFORE RETURNING
const toNumber = (val: any): number => {
  if (val == null) return 0;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'object' && typeof val.toString === 'function') {
    const num = Number(val.toString());
    return Number.isFinite(num) ? num : 0;
  }
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
};

const normalizedOrder = {
  id: order.id.toString(),
  userId: order.userId.toString(),
  orderType: order.orderType,
  orderStatus: order.orderStatus,
  paymentMethod: order.paymentMethod,
  payableAmount: toNumber(order.payableAmount),
  walletBalanceDeducted: toNumber(order.walletBalanceDeducted),
  gstPercent: toNumber(order.gstPercent),
  totalPayable: toNumber(order.totalPayable),
  couponCode: order.couponCode,
  created_at: order.created_at ? order.created_at.toISOString() : null,
  updated_at: order.updated_at ? order.updated_at.toISOString() : null,
  user: order.user ? {
    id: order.user.id.toString(),
    name: order.user.name,
    email: order.user.email,
    contactNo: order.user.contactNo,
    countryCode: order.user.countryCode,
    birthDate: order.user.birthDate ? order.user.birthDate.toISOString() : null,
    gender: order.user.gender,
  } : null,
  product: order.product ? {
    id: order.product.id.toString(),
    name: order.product.name,
    description: order.product.description,
    productImage: order.product.productImage,
    features: order.product.features,
  } : null,
  product_category: order.product_category ? {
    id: order.product_category.id.toString(),
    name: order.product_category.name,
    categoryImage: order.product_category.categoryImage,
  } : null,
  order_address: order.order_address ? {
    id: order.order_address.id.toString(),
    name: order.order_address.name,
    phoneNumber: order.order_address.phoneNumber,
    flatNo: order.order_address.flatNo,
    locality: order.order_address.locality,
    city: order.order_address.city,
    state: order.order_address.state,
    country: order.order_address.country,
    pincode: order.order_address.pincode,
  } : null,
  coupon_user_usages: order.coupon_user_usages.map((usage: any) => ({
    id: usage.id.toString(),
    amt: toNumber(usage.amt),
    coupons: {
      code: usage.coupons.code,
      discount_type: usage.coupons.discount_type,
      discount_value: toNumber(usage.coupons.discount_value),
    },
  })),
};

return NextResponse.json({
  success: true,
  data: normalizedOrder, // ✅ Return normalized data
});

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update order (status, payment, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = (await params) as { id: string };
    const id = BigInt(idStr);

    const body = await request.json();

    const {
      orderStatus,
      paymentMethod,
      orderType,
    } = body;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (orderStatus !== undefined) updateData.orderStatus = orderStatus;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (orderType !== undefined) updateData.orderType = orderType;

    const order = await prisma.order_request.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        product: true,
      },
    });

    const safeOrder = convertPrismaTypes(order);
    return NextResponse.json({
      success: true,
      data: safeOrder,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}