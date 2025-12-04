// app/api/transactions/manual/route.ts
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause - filter for manual payments only
    const where: any = {
      paymentMode: "manual", // Only manual payments
    };

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
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
      ];
    }

    // Fetch manual payments
    const [manualPayments, totalCount] = await Promise.all([
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
    const pendingCount = await prisma.payment.count({
      where: { ...where, paymentStatus: "pending" },
    });

    const approvedCount = await prisma.payment.count({
      where: { ...where, paymentStatus: "success" },
    });

    const rejectedCount = await prisma.payment.count({
      where: { ...where, paymentStatus: "failed" },
    });

    const pendingAmount = await prisma.payment.aggregate({
      where: { ...where, paymentStatus: "pending" },
      _sum: { amount: true },
    });

    return NextResponse.json(
      fixBigInt({
        success: true,
        data: manualPayments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
        statistics: {
          totalManualPayments: totalCount,
          pendingCount,
          approvedCount,
          rejectedCount,
          pendingAmount: pendingAmount._sum.amount || 0,
        },
      })
    );

  } catch (error) {
    console.error("Error fetching manual payment requests:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch manual payment requests",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}