// // app/api/earnings/astrologer/[id]/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAstrologerId(context: RouteContext): Promise<bigint> {
  const { id } = await context.params; // unwrap
  const trimmed = id.trim();

  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid astrologer id: "${id}"`);
  }

  return BigInt(trimmed);
}

// GET - Get astrologer transaction history
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const transactionType = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const astrologerId = await getAstrologerId(context);

    // Build where clause
    const where: any = { astrologerId };

    if (transactionType) where.transactionType = transactionType;

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get total count
    const total = await prisma.wallettransaction.count({ where });

    // Get transactions
    const transactions = await prisma.wallettransaction.findMany({
      where,
      include: {
        order_request: {
          select: {
            id: true,
            orderType: true,
            orderStatus: true,
            totalPayable: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate running balance and serialize BigInt
    let runningBalance = 0;
    const transactionsWithBalance = transactions.map((t) => {
      const amount = t.amount || 0;
      runningBalance += t.isCredit ? amount : -amount;

      return {
        id: t.id.toString(),
        userId: t.userId ? t.userId.toString() : null,
        astrologerId: t.astrologerId ? t.astrologerId.toString() : null,
        orderId: t.orderId ? t.orderId.toString() : null,
        aiAstrologerId: t.aiAstrologerId ? t.aiAstrologerId.toString() : null,

        amount,
        transactionType: t.transactionType,
        isCredit: !!t.isCredit,
        referred_user_id: t.referred_user_id,
        transaction_id: t.transaction_id,
        created_at: t.created_at,
        updated_at: t.updated_at,
        createdBy: t.createdBy,
        modifiedBy: t.modifiedBy,

        balance: runningBalance,
        order_request: t.order_request
          ? {
              id: t.order_request.id.toString(),
              orderType: t.order_request.orderType,
              orderStatus: t.order_request.orderStatus,
              totalPayable: t.order_request.totalPayable,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: transactionsWithBalance,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST - Manual adjustment (add/deduct amount)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const { amount, transactionType, isCredit, createdBy, notes } = body;

    if (!amount || !transactionType || isCredit === undefined || !createdBy) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const astrologerId = await getAstrologerId(context);

    const transaction = await prisma.wallettransaction.create({
      data: {
        amount: parseFloat(amount),
        astrologerId,
        transactionType,
        isCredit,
        transaction_id: notes || null,
        createdBy: parseInt(createdBy),
        modifiedBy: parseInt(createdBy),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Manual adjustment created successfully",
        data: {
          id: transaction.id.toString(),
          userId: transaction.userId
            ? transaction.userId.toString()
            : null,
          astrologerId: transaction.astrologerId
            ? transaction.astrologerId.toString()
            : null,
          orderId: transaction.orderId
            ? transaction.orderId.toString()
            : null,
          aiAstrologerId: transaction.aiAstrologerId
            ? transaction.aiAstrologerId.toString()
            : null,
          amount: transaction.amount || 0,
          transactionType: transaction.transactionType,
          isCredit: !!transaction.isCredit,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at,
          createdBy: transaction.createdBy,
          modifiedBy: transaction.modifiedBy,
          transaction_id: transaction.transaction_id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create adjustment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create adjustment" },
      { status: 500 }
    );
  }
}
