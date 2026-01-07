// src/lib/profile/orders.ts
import { prisma } from "@/lib/prisma";

export interface OrderFilters {
  orderType?: string;
  orderStatus?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Get user orders with pagination and filters
 */
export async function getUserOrders(userId: bigint, filters: OrderFilters = {}) {
  const {
    orderType,
    orderStatus,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {
    userId,
    isDelete: "0",
  };

  if (orderType) where.orderType = orderType;
  if (orderStatus) where.orderStatus = orderStatus;
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at.gte = startDate;
    if (endDate) where.created_at.lte = endDate;
  }

  const [orders, total] = await Promise.all([
    prisma.order_request.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImage: true,
            amount: true,
          },
        },
        product_category: {
          select: {
            id: true,
            name: true,
            categoryImage: true,
          },
        },
        astrologer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        aiAstrologer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        order_address: true,
      },
    }),
    prisma.order_request.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single order details
 */
export async function getOrderDetails(orderId: bigint, userId: bigint) {
  const order = await prisma.order_request.findFirst({
    where: {
      id: orderId,
      userId,
      isDelete: "0",
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          productImage: true,
          amount: true,
          description: true,
          features: true,
        },
      },
      product_category: {
        select: {
          id: true,
          name: true,
        },
      },
      astrologer: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          contactNo: true,
        },
      },
      aiAstrologer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      order_address: true,
      callrequest: {
        select: {
          id: true,
          callStatus: true,
          totalMin: true,
          call_duration: true,
          created_at: true,
        },
      },
      coupon_user_usages: {
        select: {
          amt: true,
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

  return order;
}

/**
 * Get order statistics
 */
export async function getOrderStatistics(userId: bigint) {
  const [totalOrders, completedOrders, pendingOrders, totalSpent] = await Promise.all([
    prisma.order_request.count({
      where: { userId, isDelete: "0" },
    }),
    prisma.order_request.count({
      where: { userId, isDelete: "0", orderStatus: "Completed" },
    }),
    prisma.order_request.count({
      where: { userId, isDelete: "0", orderStatus: "Pending" },
    }),
    prisma.order_request.aggregate({
      where: { userId, isDelete: "0", orderStatus: "Completed" },
      _sum: { totalPayable: true },
    }),
  ]);

  return {
    total_orders: totalOrders,
    completed_orders: completedOrders,
    pending_orders: pendingOrders,
    total_spent: totalSpent._sum.totalPayable || 0,
  };
}