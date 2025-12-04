// app/api/transactions/wallet/route.ts
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
    const transactionType = searchParams.get("transactionType") || undefined;
    const isCredit = searchParams.get("isCredit");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (isCredit !== null && isCredit !== undefined && isCredit !== "") {
      where.isCredit = isCredit === "true";
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

    // Search in user details
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { contactNo: { contains: search } },
        ],
      };
    }

    // Fetch transactions
    const [transactions, totalCount] = await Promise.all([
      prisma.wallettransaction.findMany({
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
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          ai_astrologer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          order_request: {
            select: {
              id: true,
              orderType: true,
              orderStatus: true,
              totalPayable: true,
            },
          },
        },
      }),
      prisma.wallettransaction.count({ where }),
    ]);

    // Calculate statistics
    const stats = await prisma.wallettransaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const creditSum = await prisma.wallettransaction.aggregate({
      where: { ...where, isCredit: true },
      _sum: { amount: true },
    });

    const debitSum = await prisma.wallettransaction.aggregate({
      where: { ...where, isCredit: false },
      _sum: { amount: true },
    });

return NextResponse.json(
  fixBigInt({
    success: true,
    data: transactions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit,
    },
    statistics: {
      totalTransactions: stats._count.id,
      totalAmount: stats._sum.amount || 0,
      totalCredit: creditSum._sum.amount || 0,
      totalDebit: debitSum._sum.amount || 0,
      netAmount:
        (creditSum._sum.amount || 0) - (debitSum._sum.amount || 0),
    },
  })
);

  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch wallet transactions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}