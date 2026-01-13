import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Safe parse helper
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parsePeriodDays(periodStr: string | null | undefined, fallbackDays = 30) {
  const n = Number(periodStr ?? fallbackDays);
  if (!Number.isFinite(n) || n <= 0) return fallbackDays;
  return Math.round(n);
}

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

// GET - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodStr = searchParams.get('period') || '30';
    const periodDays = parsePeriodDays(periodStr, 30);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    startDate.setHours(0, 0, 0, 0);

    const todayStart = startOfToday();

    const productOrderWhere = {
      isDelete: '0',
      productId: { not: null },
    };

    const deliveredOrderWhere = {
      ...productOrderWhere,
      orderStatus: 'delivered',
    };

    // 1. Fetch Aggregates & Raw Lists (Parallel)
    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      periodRevenue,
      todayRevenue,
      
      // Raw Recent Orders (No Includes)
      rawRecentOrders,

      // Top products (Raw SQL)
      topProducts,

      // Revenue by date (Raw SQL)
      revenueByDate,

      // Orders by status (Raw SQL)
      ordersByStatus,
    ] = await Promise.all([
      // Products
      prisma.astromall_products.count({ where: { isDelete: false } }),
      prisma.astromall_products.count({ where: { isDelete: false, isActive: true } }),
      prisma.product_categories.count({ where: { isDelete: false } }),

      // Orders
      prisma.order_request.count({ where: productOrderWhere }),
      prisma.order_request.count({ where: { ...productOrderWhere, created_at: { gte: todayStart } } }),
      prisma.order_request.count({ where: { ...productOrderWhere, orderStatus: 'pending' } }),
      prisma.order_request.count({ where: { ...productOrderWhere, orderStatus: { in: ['completed', 'delivered'] } } }),

      // Revenue
      prisma.order_request.aggregate({ where: deliveredOrderWhere, _sum: { totalPayable: true } }),
      prisma.order_request.aggregate({ where: { ...deliveredOrderWhere, created_at: { gte: startDate } }, _sum: { totalPayable: true } }),
      prisma.order_request.aggregate({ where: { ...deliveredOrderWhere, created_at: { gte: todayStart } }, _sum: { totalPayable: true } }),

      // Recent Orders - Raw Fetch Only
      prisma.order_request.findMany({
        where: productOrderWhere,
        take: 10,
        orderBy: { created_at: 'desc' },
        // NO INCLUDE HERE - Causes issues
      }),

      // Top products
      prisma.$queryRaw`
        SELECT p.id, p.name, p.productImage, p.amount, COUNT(o.id) as orderCount,
        SUM(CASE WHEN o.orderStatus = 'delivered' THEN o.totalPayable ELSE 0 END) as totalRevenue
        FROM astromall_products p
        LEFT JOIN order_request o ON o.productId = p.id AND o.isDelete = '0'
        WHERE p.isDelete = false
        GROUP BY p.id, p.name, p.productImage, p.amount
        ORDER BY orderCount DESC LIMIT 5
      `,

      // Revenue by date
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(totalPayable) as revenue
        FROM order_request
        WHERE isDelete = '0' AND productId IS NOT NULL AND orderStatus = 'delivered' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at) ORDER BY date DESC
      `,

      // Orders by status
      prisma.$queryRaw`
        SELECT orderStatus, COUNT(*) as count FROM order_request
        WHERE isDelete = '0' AND productId IS NOT NULL GROUP BY orderStatus
      `,
    ]);

    // 2. Manual Join Strategy for Recent Orders
    const userIds = new Set<string>();
    const productIds = new Set<string>();

    rawRecentOrders.forEach(o => {
        if (o.userId) userIds.add(o.userId.toString());
        if (o.productId) productIds.add(o.productId.toString());
    });

    // Fetch Users Manually
    const userMap = new Map();
    if (userIds.size > 0) {
        const users = await prisma.users.findMany({
            where: { id: { in: Array.from(userIds).map(id => BigInt(id)) } },
            select: { id: true, name: true, email: true, contactNo: true }
        });
        users.forEach(u => userMap.set(u.id.toString(), u));
    }

    // Fetch Products Manually
    const productMap = new Map();
    if (productIds.size > 0) {
        const products = await prisma.astromall_products.findMany({
            where: { id: { in: Array.from(productIds).map(id => BigInt(id)) } },
            select: { id: true, name: true, productImage: true }
        });
        products.forEach(p => productMap.set(p.id.toString(), p));
    }

    // Stitch & Normalize Recent Orders
    const normalizedRecentOrders = rawRecentOrders.map((o) => {
      const u = o.userId ? userMap.get(o.userId.toString()) : null;
      const p = o.productId ? productMap.get(o.productId.toString()) : null;

      return {
        id: o.id.toString(),
        userId: o.userId.toString(),
        orderType: o.orderType,
        orderStatus: o.orderStatus,
        totalPayable: toNumber(o.totalPayable),
        paymentMethod: o.paymentMethod,
        created_at: o.created_at ? o.created_at.toISOString() : null,
        
        user: u ? {
            name: u.name,
            email: u.email
        } : { name: "Unknown", email: "N/A" },

        product: p ? {
            name: p.name,
            productImage: p.productImage
        } : { name: "Unknown Product", productImage: null }
      };
    });

    // --- Normalization for other raw queries ---
    const topProductsArr = Array.isArray(topProducts) ? topProducts : [];
    const revenueByDateArr = Array.isArray(revenueByDate) ? revenueByDate : [];
    const ordersByStatusArr = Array.isArray(ordersByStatus) ? ordersByStatus : [];

    const normalizedTopProducts = topProductsArr.map((p: any) => ({
      id: p.id?.toString(),
      name: p.name,
      productImage: p.productImage,
      amount: toNumber(p.amount),
      orderCount: toNumber(p.orderCount),
      totalRevenue: toNumber(p.totalRevenue),
    }));

    const normalizedRevenueByDate = revenueByDateArr.map((r: any) => ({
      date: r?.date ? (typeof r.date === 'string' ? r.date : String(r.date)) : null,
      orders: toNumber(r.orders),
      revenue: toNumber(r.revenue),
    }));

    const normalizedOrdersByStatus = ordersByStatusArr.map((s: any) => ({
      orderStatus: s.orderStatus,
      count: toNumber(s.count),
    }));

    const safeTotalRevenue = totalRevenue?._sum?.totalPayable ? toNumber(totalRevenue._sum.totalPayable) : 0;
    const safePeriodRevenue = periodRevenue?._sum?.totalPayable ? toNumber(periodRevenue._sum.totalPayable) : 0;
    const safeTodayRevenue = todayRevenue?._sum?.totalPayable ? toNumber(todayRevenue._sum.totalPayable) : 0;

    const responseData = {
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          categories: totalCategories,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          pending: pendingOrders,
          completed: completedOrders,
        },
        revenue: {
          total: safeTotalRevenue,
          period: safePeriodRevenue,
          today: safeTodayRevenue,
        },
        recentOrders: normalizedRecentOrders,
        topProducts: normalizedTopProducts,
        revenueByDate: normalizedRevenueByDate,
        ordersByStatus: normalizedOrdersByStatus,
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