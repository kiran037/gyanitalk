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

// GET - Get order statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          gte: new Date(startDate + 'T00:00:00'),
          lte: new Date(endDate + 'T23:59:59'),
        },
      };
    }

    // Base filter for product/mall orders only
    const productOrderFilter = {
      isDelete: '0',
      productId: { not: null },
    };

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      recentOrders,
      ordersByStatus,
      ordersByType,
    ] = await Promise.all([
      // Total orders (product/mall only)
      prisma.order_request.count({
        where: {
          ...productOrderFilter,
          ...dateFilter,
        },
      }),

      // Pending orders
      prisma.order_request.count({
        where: {
          ...productOrderFilter,
          orderStatus: 'pending',
          ...dateFilter,
        },
      }),

      // Completed orders (delivered only for accurate revenue tracking)
      prisma.order_request.count({
        where: {
          ...productOrderFilter,
          orderStatus: 'delivered',
          ...dateFilter,
        },
      }),

      // Cancelled orders
      prisma.order_request.count({
        where: {
          ...productOrderFilter,
          orderStatus: 'cancelled',
          ...dateFilter,
        },
      }),

      // Total revenue (only delivered orders)
      prisma.order_request.aggregate({
        where: {
          ...productOrderFilter,
          orderStatus: 'delivered',
          ...dateFilter,
        },
        _sum: {
          totalPayable: true,
        },
      }),

      // Recent orders (product/mall only)
      prisma.order_request.findMany({
        where: {
          ...productOrderFilter,
          ...dateFilter,
        },
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
              // Don't select amount - use totalPayable
            },
          },
        },
      }),

      // Orders by status (product/mall only)
      (startDate && endDate
        ? prisma.$queryRawUnsafe<any[]>(
          `SELECT 
              orderStatus,
              COUNT(*) as count
            FROM order_request
            WHERE isDelete = '0'
              AND productId IS NOT NULL
              AND created_at >= ?
              AND created_at <= ?
            GROUP BY orderStatus`,
          dateFilter.created_at.gte,
          dateFilter.created_at.lte
        )
        : prisma.$queryRaw<any[]>`
            SELECT 
              orderStatus,
              COUNT(*) as count
            FROM order_request
            WHERE isDelete = '0'
              AND productId IS NOT NULL
            GROUP BY orderStatus
        `),

      // Orders by type (product/mall only)
      (startDate && endDate
        ? prisma.$queryRawUnsafe<any[]>(
          `SELECT 
              orderType,
              COUNT(*) as count,
              SUM(CASE WHEN orderStatus = 'delivered' THEN totalPayable ELSE 0 END) as revenue
            FROM order_request
            WHERE isDelete = '0'
              AND productId IS NOT NULL
              AND created_at >= ?
              AND created_at <= ?
            GROUP BY orderType`,
          dateFilter.created_at.gte,
          dateFilter.created_at.lte
        )
        : prisma.$queryRaw<any[]>`
            SELECT 
              orderType,
              COUNT(*) as count,
              SUM(CASE WHEN orderStatus = 'delivered' THEN totalPayable ELSE 0 END) as revenue
            FROM order_request
            WHERE isDelete = '0'
              AND productId IS NOT NULL
            GROUP BY orderType
          `),
    ]);

    const responseData = {
      success: true,
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue: Number(totalRevenue?._sum?.totalPayable?.toString?.() ?? 0),
        },
        recentOrders,
        ordersByStatus,
        ordersByType,
      },
    };

    const safeResponse = convertPrismaTypes(responseData);
    return NextResponse.json(safeResponse);

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}