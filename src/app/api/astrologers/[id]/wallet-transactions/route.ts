// app/api/astrologers/[id]/wallet-transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(id);
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filters
    const transactionType = searchParams.get("transactionType");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const isCredit = searchParams.get("isCredit");

    const where: any = {
      astrologerId,
    };

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (isCredit !== null && isCredit !== undefined) {
      where.isCredit = isCredit === "true";
    }

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) {
        where.created_at.gte = new Date(fromDate);
      }
      if (toDate) {
        where.created_at.lte = new Date(toDate);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.wallettransaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
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
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.wallettransaction.count({ where }),
    ]);

    const allTransactions = await prisma.wallettransaction.findMany({
      where: { astrologerId },
      select: {
        amount: true,
        isCredit: true,
      },
    });

    const walletBalance = allTransactions.reduce(
      (sum: number, t: any) =>
        t.isCredit ? sum + (t.amount || 0) : sum - (t.amount || 0),
      0
    );

    const totalCredit = allTransactions
      .filter((t: any) => t.isCredit)
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const totalDebit = allTransactions
      .filter((t: any) => !t.isCredit)
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const safe = convertPrismaTypes({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        walletBalance: walletBalance.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        totalDebit: totalDebit.toFixed(2),
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching wallet transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch wallet transactions",
        message: error.message,
      },
      { status: 500 }
    );
  }
}