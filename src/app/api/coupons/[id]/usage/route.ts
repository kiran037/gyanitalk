// app/api/coupons/[id]/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get usage analytics for a specific coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = BigInt(params.id);
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Check if coupon exists
    const coupon = await prisma.coupons.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Get usage data with pagination
    const [usages, totalUsage] = await Promise.all([
      prisma.coupon_user_usages.findMany({
        where: { coupon_id: couponId },
        skip,
        take: limit,
        orderBy: { used_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
            },
          },
          order_request: {
            select: {
              id: true,
              totalPayable: true,
              orderStatus: true,
              created_at: true,
            },
          },
        },
      }),
      prisma.coupon_user_usages.count({
        where: { coupon_id: couponId },
      }),
    ]);

    // Calculate analytics
    const totalDiscountGiven = await prisma.coupon_user_usages.aggregate({
      where: { coupon_id: couponId },
      _sum: { amt: true },
      _avg: { amt: true },
      _max: { amt: true },
      _min: { amt: true },
    });

    // Usage by type
    const usageByType = await prisma.coupon_user_usages.groupBy({
      by: ['type'],
      where: { coupon_id: couponId },
      _count: true,
    });

    // Get unique users count
    const uniqueUsers = await prisma.coupon_user_usages.groupBy({
      by: ['userId'],
      where: { coupon_id: couponId },
    });

    // Usage over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usageOverTime = await prisma.coupon_user_usages.findMany({
      where: {
        coupon_id: couponId,
        used_at: { gte: thirtyDaysAgo },
      },
      select: {
        used_at: true,
        amt: true,
      },
      orderBy: { used_at: 'asc' },
    });

    // Group by date
    const usageByDate = usageOverTime.reduce((acc, usage) => {
      const date = usage.used_at.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, totalDiscount: 0 };
      }
      acc[date].count++;
      acc[date].totalDiscount += usage.amt || 0;
      return acc;
    }, {} as Record<string, { count: number; totalDiscount: number }>);

    // Format usage data
    const formattedUsages = usages.map(usage => ({
      id: usage.id.toString(),
      userId: usage.userId.toString(),
      user: usage.users,
      orderId: usage.order_id?.toString(),
      order: usage.order_request,
      amount: usage.amt,
      type: usage.type,
      usedAt: usage.used_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id.toString(),
          code: coupon.code,
          type: coupon.type,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          usage_limit: coupon.usage_limit,
          usage_limit_per_user: coupon.usage_limit_per_user,
        },
        analytics: {
          totalUsage,
          uniqueUsers: uniqueUsers.length,
          remainingUsage: coupon.usage_limit 
            ? coupon.usage_limit - totalUsage 
            : null,
          totalDiscountGiven: totalDiscountGiven._sum.amt || 0,
          averageDiscountPerUse: totalDiscountGiven._avg.amt || 0,
          maxDiscountGiven: totalDiscountGiven._max.amt || 0,
          minDiscountGiven: totalDiscountGiven._min.amt || 0,
          usageByType: usageByType.reduce((acc, item) => {
            acc[item.type || 'unknown'] = item._count;
            return acc;
          }, {} as Record<string, number>),
          usageByDate,
        },
        usages: formattedUsages,
        pagination: {
          page,
          limit,
          total: totalUsage,
          totalPages: Math.ceil(totalUsage / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching coupon usage:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch coupon usage' },
      { status: 500 }
    );
  }
}