import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to safely convert Decimal to number
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

// Helper: convert BigInt / Date -> JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj === 'object' && (obj as any).constructor && (obj as any).constructor.name === 'Decimal') {
    return toNumber(obj);
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
  { params }: { params: Promise<{ id: string }> } // Fix for Next 15
) {
  try {
    const { id: idStr } = await params;
    const id = BigInt(idStr);

    // 1. Fetch RAW Order
    const order = await prisma.order_request.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (!order.productId) {
      return NextResponse.json({ success: false, error: 'Not a product order' }, { status: 400 });
    }

    // 2. Manual Fetch Relations
    let user = null;
    let product = null;
    let category = null;
    let address = null;
    let coupons = [];

    // User
    if (order.userId) {
        user = await prisma.users.findUnique({
            where: { id: order.userId },
            select: { id: true, name: true, email: true, contactNo: true, countryCode: true, birthDate: true, gender: true }
        });
    }

    // Product
    if (order.productId) {
        product = await prisma.astromall_products.findUnique({
            where: { id: order.productId },
            select: { id: true, name: true, description: true, productImage: true, features: true }
        });
    }

    // Category
    if (order.productCategoryId) {
        category = await prisma.product_categories.findUnique({
            where: { id: order.productCategoryId },
            select: { id: true, name: true, categoryImage: true }
        });
    }

    // Address
    if (order.orderAddressId) {
        address = await prisma.order_addresses.findUnique({
            where: { id: order.orderAddressId }
        });
    }

    // Coupon Usage
    const usages = await prisma.coupon_user_usages.findMany({
        where: { order_id: id },
        include: {
            coupons: {
                select: { code: true, discount_type: true, discount_value: true }
            }
        }
    });

    // 3. Stitch & Normalize
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
      
      user: user ? {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        countryCode: user.countryCode,
        birthDate: user.birthDate ? user.birthDate.toISOString() : null,
        gender: user.gender,
      } : null,

      product: product ? {
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        productImage: product.productImage,
        features: product.features,
      } : null,

      product_category: category ? {
        id: category.id.toString(),
        name: category.name,
        categoryImage: category.categoryImage,
      } : null,

      order_address: address ? {
        id: address.id.toString(),
        name: address.name,
        phoneNumber: address.phoneNumber,
        flatNo: address.flatNo,
        locality: address.locality,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
      } : null,

      coupon_user_usages: usages.map((usage: any) => ({
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
      data: normalizedOrder,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update order (No changes needed, but ensuring params is Promise)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
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