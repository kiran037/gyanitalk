// app/api/transactions/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function fixBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const paymentMode = searchParams.get("paymentMode") || undefined;
    const type = searchParams.get("type") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMode) {
      where.paymentMode = paymentMode;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate);
      }
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        where.amount.lte = parseFloat(maxAmount);
      }
    }

    // Search
    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { contactNo: { contains: search } },
            ],
          },
        },
        { paymentReference: { contains: search } },
        { orderId: { contains: search } },
      ];
    }

    // Fetch payments
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
              contactNo: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    // Calculate statistics
    const stats = await prisma.payment.aggregate({
      where,
      _sum: {
        amount: true,
        cashback_amount: true,
      },
      _count: {
        id: true,
      },
    });

    const successfulPayments = await prisma.payment.aggregate({
      where: { ...where, paymentStatus: "success" },
      _sum: { amount: true },
      _count: { id: true },
    });

    const failedPayments = await prisma.payment.aggregate({
      where: { ...where, paymentStatus: "failed" },
      _count: { id: true },
    });

    const pendingPayments = await prisma.payment.aggregate({
      where: { ...where, paymentStatus: "pending" },
      _count: { id: true },
    });

return NextResponse.json(
  fixBigInt({
    success: true,
    data: payments,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit,
    },
    statistics: {
      totalPayments: stats._count.id,
      totalAmount: stats._sum.amount || 0,
      totalCashback: stats._sum.cashback_amount || 0,
      successfulPayments: {
        count: successfulPayments._count.id,
        amount: successfulPayments._sum.amount || 0,
      },
      failedPayments: failedPayments._count.id,
      pendingPayments: pendingPayments._count.id,
    },
  })
);

  } catch (error) {
    console.error("Error fetching payment transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment transactions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}