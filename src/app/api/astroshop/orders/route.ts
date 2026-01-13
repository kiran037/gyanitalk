import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to safely convert Decimal/BigInt
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

// GET - List all orders with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const orderStatus = searchParams.get('orderStatus');
    const orderType = searchParams.get('orderType');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const where: any = {
      isDelete: '0',
      productId: { not: null }, // only mall/product orders
    };

    if (orderStatus) where.orderStatus = orderStatus;
    if (orderType) where.orderType = orderType;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate + 'T00:00:00'),
        lte: new Date(endDate + 'T23:59:59'),
      };
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 1. Fetch RAW Orders
    const [rawOrders, total] = await Promise.all([
      prisma.order_request.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.order_request.count({ where }),
    ]);

    // 2. Extract IDs for manual fetching
    const userIds = new Set<string>();
    const productIds = new Set<string>();
    const categoryIds = new Set<string>();
    const addressIds = new Set<string>();

    rawOrders.forEach(o => {
        if (o.userId) userIds.add(o.userId.toString());
        if (o.productId) productIds.add(o.productId.toString());
        if (o.productCategoryId) categoryIds.add(o.productCategoryId.toString());
        if (o.orderAddressId) addressIds.add(o.orderAddressId.toString());
    });

    // 3. Manual Fetch - USERS
    const userMap = new Map();
    if (userIds.size > 0) {
        const users = await prisma.users.findMany({
            where: { id: { in: Array.from(userIds).map(id => BigInt(id)) } },
            select: { id: true, name: true, email: true, contactNo: true, profile: true }
        });
        users.forEach(u => userMap.set(u.id.toString(), u));
    }

    // 4. Manual Fetch - PRODUCTS
    const productMap = new Map();
    if (productIds.size > 0) {
        const products = await prisma.astromall_products.findMany({
            where: { id: { in: Array.from(productIds).map(id => BigInt(id)) } },
            select: { id: true, name: true, productImage: true }
        });
        products.forEach(p => productMap.set(p.id.toString(), p));
    }

    // 5. Manual Fetch - CATEGORIES
    const categoryMap = new Map();
    if (categoryIds.size > 0) {
        const cats = await prisma.product_categories.findMany({
            where: { id: { in: Array.from(categoryIds).map(id => BigInt(id)) } },
            select: { id: true, name: true }
        });
        cats.forEach(c => categoryMap.set(c.id.toString(), c));
    }

    // 6. Manual Fetch - ADDRESSES
    const addressMap = new Map();
    if (addressIds.size > 0) {
        const addrs = await prisma.order_addresses.findMany({
            where: { id: { in: Array.from(addressIds).map(id => BigInt(id)) } },
        });
        addrs.forEach(a => addressMap.set(a.id.toString(), a));
    }

    // 7. Stitch & Normalize
    let normalizedOrders = rawOrders.map((order) => {
      const u = order.userId ? userMap.get(order.userId.toString()) : null;
      const p = order.productId ? productMap.get(order.productId.toString()) : null;
      const c = order.productCategoryId ? categoryMap.get(order.productCategoryId.toString()) : null;
      const a = order.orderAddressId ? addressMap.get(order.orderAddressId.toString()) : null;

      return {
        id: order.id.toString(),
        userId: order.userId.toString(),
        orderType: order.orderType,
        productId: order.productId?.toString() ?? null,
        productCategoryId: order.productCategoryId?.toString() ?? null,
        orderAddressId: order.orderAddressId?.toString() ?? null,
        payableAmount: toNumber(order.payableAmount),
        walletBalanceDeducted: toNumber(order.walletBalanceDeducted),
        gstPercent: toNumber(order.gstPercent),
        totalPayable: toNumber(order.totalPayable),
        couponCode: order.couponCode,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
        totalMin: order.totalMin,
        isActive: order.isActive,
        isDelete: order.isDelete,
        created_at: order.created_at ? order.created_at.toISOString() : null,
        updated_at: order.updated_at ? order.updated_at.toISOString() : null,
        
        user: u ? {
            id: u.id.toString(),
            name: u.name,
            email: u.email,
            contactNo: u.contactNo,
            profile: u.profile,
        } : null,

        product: p ? {
            id: p.id.toString(),
            name: p.name,
            productImage: p.productImage,
        } : null,

        product_category: c ? {
            id: c.id.toString(),
            name: c.name,
        } : null,

        order_address: a ? {
            id: a.id.toString(),
            name: a.name,
            phoneNumber: a.phoneNumber,
            flatNo: a.flatNo,
            locality: a.locality,
            city: a.city,
            state: a.state,
            country: a.country,
            pincode: a.pincode,
        } : null,
      };
    });

    // 8. Search Logic (In-Memory because names are stitched manually)
    if (search) {
      const s = search.toLowerCase();
      normalizedOrders = normalizedOrders.filter(o => 
        o.id.includes(s) || 
        o.user?.name?.toLowerCase().includes(s) || 
        o.user?.contactNo?.includes(s)
      );
    }

    const responseData = {
      success: true,
      data: normalizedOrders,
      pagination: {
        page,
        limit,
        total: search ? normalizedOrders.length : total,
        totalPages: Math.ceil((search ? normalizedOrders.length : total) / limit),
      },
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}