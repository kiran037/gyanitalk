import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Safe parse helper (keeps midnight boundary and guards invalid input)
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

// GET - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodStr = searchParams.get('period') || '30';
    const periodDays = parsePeriodDays(periodStr, 30);

    // startDate is periodDays before now (used for period revenue)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    startDate.setHours(0, 0, 0, 0);

    // alias for today's start
    const todayStart = startOfToday();

    // Common where clause for product/mall orders only
    const productOrderWhere = {
      isDelete: '0',
      productId: { not: null },
    };

    // Common where clause for delivered orders only (for revenue)
    const deliveredOrderWhere = {
      ...productOrderWhere,
      orderStatus: 'delivered',
    };

    const [
      // Product stats
      totalProducts,
      activeProducts,
      totalCategories,

      // Order stats
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,

      // Revenue stats (only delivered orders)
      totalRevenue,
      periodRevenue,
      todayRevenue,

      // Recent orders
      recentOrders,

      // Top products (raw)
      topProducts,

      // Revenue by date (raw)
      revenueByDate,

      // Orders by status (raw)
      ordersByStatus,
    ] = await Promise.all([
      // Products
      prisma.astromall_products.count({
        where: { isDelete: false },
      }),
      prisma.astromall_products.count({
        where: { isDelete: false, isActive: true },
      }),
      prisma.product_categories.count({
        where: { isDelete: false },
      }),

      // Orders (only product/mall orders)
      prisma.order_request.count({
        where: productOrderWhere,
      }),
      prisma.order_request.count({
        where: {
          ...productOrderWhere,
          created_at: {
            gte: todayStart,
          },
        },
      }),
      prisma.order_request.count({
        where: {
          ...productOrderWhere,
          orderStatus: 'pending',
        },
      }),
      prisma.order_request.count({
        where: {
          ...productOrderWhere,
          orderStatus: {
            in: ['completed', 'delivered'],
          },
        },
      }),

      // Revenue aggregates (only delivered product/mall orders)
      prisma.order_request.aggregate({
        where: deliveredOrderWhere,
        _sum: {
          totalPayable: true,
        },
      }),
      prisma.order_request.aggregate({
        where: {
          ...deliveredOrderWhere,
          created_at: {
            gte: startDate,
          },
        },
        _sum: {
          totalPayable: true,
        },
      }),
      prisma.order_request.aggregate({
        where: {
          ...deliveredOrderWhere,
          created_at: {
            gte: todayStart,
          },
        },
        _sum: {
          totalPayable: true,
        },
      }),

      // Recent orders (only product/mall orders)
      prisma.order_request.findMany({
        where: productOrderWhere,
        take: 10,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              name: true,
              productImage: true,
              // Don't select amount here - use totalPayable from order instead
            },
          },
        },
      }),

      // Top products - only count delivered orders for revenue
      prisma.$queryRaw`
        SELECT 
          p.id,
          p.name,
          p.productImage,
          p.amount,
          COUNT(o.id) as orderCount,
          SUM(CASE WHEN o.orderStatus = 'delivered' THEN o.totalPayable ELSE 0 END) as totalRevenue
        FROM astromall_products p
        LEFT JOIN order_request o ON o.productId = p.id 
          AND o.isDelete = '0'
        WHERE p.isDelete = false
        GROUP BY p.id, p.name, p.productImage, p.amount
        ORDER BY orderCount DESC
        LIMIT 5
      `,

      // Revenue by date (last 7 days) — only delivered product orders
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          SUM(totalPayable) as revenue
        FROM order_request
        WHERE isDelete = '0' 
          AND productId IS NOT NULL
          AND orderStatus = 'delivered'
          AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,

      // Orders by status — only product orders
      prisma.$queryRaw`
        SELECT 
          orderStatus,
          COUNT(*) as count
        FROM order_request
        WHERE isDelete = '0'
          AND productId IS NOT NULL
        GROUP BY orderStatus
      `,
    ]);

    // --- Fix TS typing so .map is safe ---
    const recentOrdersArr = Array.isArray(recentOrders) ? recentOrders : [];
    const topProductsArr = Array.isArray(topProducts) ? topProducts : [];
    const revenueByDateArr = Array.isArray(revenueByDate) ? revenueByDate : [];
    const ordersByStatusArr = Array.isArray(ordersByStatus) ? ordersByStatus : [];

    // ---------- Normalization: convert Dates/Decimals/raw strings -> stable JS primitives ----------
    // Normalize recentOrders - use totalPayable from order, not product.amount
    const normalizedRecentOrders = recentOrdersArr.map((o: any) => {
      let createdAtIso: string | null = null;
      if (o?.created_at) {
        try {
          const d = o.created_at instanceof Date ? o.created_at : new Date(o.created_at);
          createdAtIso = isNaN(d.getTime()) ? null : d.toISOString();
        } catch {
          createdAtIso = null;
        }
      }

      // Convert totalPayable (Decimal) to number
      let totalPayable = 0;
      if (o?.totalPayable != null) {
        if (typeof o.totalPayable === 'object' && typeof o.totalPayable.toString === 'function') {
          const converted = Number(o.totalPayable.toString());
          totalPayable = Number.isFinite(converted) ? converted : 0;
        } else {
          const converted = Number(o.totalPayable);
          totalPayable = Number.isFinite(converted) ? converted : 0;
        }
      }

      return {
        id: o.id?.toString(),
        userId: o.userId?.toString(),
        orderType: o.orderType,
        orderStatus: o.orderStatus,
        totalPayable: totalPayable,
        paymentMethod: o.paymentMethod,
        created_at: createdAtIso,
        user: o.user,
        product: o.product, // Just name and image, no amount
      };
    });

    // Normalize topProducts (raw SQL returns strings for numeric fields sometimes)
    const normalizedTopProducts = topProductsArr.map((p: any) => ({
      id: p.id,
      name: p.name,
      productImage: p.productImage,
      amount: p.amount != null ? Number(p.amount) : 0,
      orderCount: p.orderCount != null ? Number(p.orderCount) : 0,
      totalRevenue: p.totalRevenue != null ? Number(p.totalRevenue) : 0,
    }));

    // Normalize revenueByDate (raw SQL)
    const normalizedRevenueByDate = revenueByDateArr.map((r: any) => {
      const dateStr = r?.date ? (typeof r.date === 'string' ? r.date : String(r.date)) : null;
      return {
        date: dateStr,
        orders: r.orders != null ? Number(r.orders) : 0,
        revenue: r.revenue != null ? Number(r.revenue) : 0,
      };
    });

    // Normalize ordersByStatus (raw SQL)
    const normalizedOrdersByStatus = ordersByStatusArr.map((s: any) => ({
      orderStatus: s.orderStatus,
      count: s.count != null ? Number(s.count) : 0,
    }));

    // Safe conversion for aggregate sums: totalPayable is Decimal
    const safeTotalRevenue = totalRevenue?._sum?.totalPayable 
      ? Number(totalRevenue._sum.totalPayable.toString()) 
      : 0;
    const safePeriodRevenue = periodRevenue?._sum?.totalPayable
      ? Number(periodRevenue._sum.totalPayable.toString())
      : 0;
    const safeTodayRevenue = todayRevenue?._sum?.totalPayable
      ? Number(todayRevenue._sum.totalPayable.toString())
      : 0;

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
        recentOrders: normalizedRecentOrders, // Already fully normalized
        topProducts: normalizedTopProducts.map(p => ({
          ...p,
          id: p.id?.toString(),
        })),
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