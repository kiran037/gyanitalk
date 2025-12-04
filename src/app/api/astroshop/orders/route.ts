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

    if (orderStatus) {
      where.orderStatus = orderStatus;
    }

    if (orderType) {
      where.orderType = orderType;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate + 'T00:00:00'),
        lte: new Date(endDate + 'T23:59:59'),
      };
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [orders, total] = await Promise.all([
      prisma.order_request.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
              profile: true, // ✅ Add profile image for customer link
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              productImage: true,
              // Don't select amount - use totalPayable from order
            },
          },
          product_category: {
            select: {
              id: true,
              name: true,
            },
          },
          order_address: true,
        },
      }),
      prisma.order_request.count({ where }),
    ]);

    // Search filter (applied after fetch for related fields)
    let filteredOrders = orders;
    if (search) {
      filteredOrders = orders.filter(
        (order) =>
          order.id.toString().includes(search) ||
          order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          order.user?.contactNo?.includes(search)
      );
    }

    // ✅ Normalize orders - convert all Decimals and BigInts manually
    const normalizedOrders = filteredOrders.map((order) => ({
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
      // User data with profile for customer link
      user: order.user ? {
        id: order.user.id.toString(),
        name: order.user.name,
        email: order.user.email,
        contactNo: order.user.contactNo,
        profile: order.user.profile,
      } : null,
      // Product data
      product: order.product ? {
        id: order.product.id.toString(),
        name: order.product.name,
        productImage: order.product.productImage,
      } : null,
      // Category data
      product_category: order.product_category ? {
        id: order.product_category.id.toString(),
        name: order.product_category.name,
      } : null,
      // Address data
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
    }));

    const responseData = {
      success: true,
      data: normalizedOrders,
      pagination: {
        page,
        limit,
        total: search ? filteredOrders.length : total,
        totalPages: Math.ceil((search ? filteredOrders.length : total) / limit),
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