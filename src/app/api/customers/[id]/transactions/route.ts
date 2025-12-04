// app/api/customers/[id]/transactions/route.ts
// GET: Get customer wallet transactions

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type"); // 'credit' or 'debit'

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };
    if (type === "credit") {
      whereClause.isCredit = true;
    } else if (type === "debit") {
      whereClause.isCredit = false;
    }

    // Get total count
    const totalCount = await prisma.wallettransaction.count({
      where: whereClause,
    });

    // Fetch transactions
    const transactions = await prisma.wallettransaction.findMany({
      where: whereClause,
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
          },
        },
        ai_astrologer: {
          select: {
            id: true,
            name: true,
          },
        },
        order_request: {
          select: {
            id: true,
            orderType: true,
            orderStatus: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const formattedTransactions = transactions.map((txn) => ({
      id: txn.id,
      amount: txn.amount?.toString() || "0",
      transactionType: txn.transactionType,
      transactionId: txn.transaction_id,
      isCredit: txn.isCredit,
      orderId: txn.orderId?.toString() || null,
      orderType: txn.order_request?.orderType || null,
      astrologerId: txn.astrologerId?.toString() || null,
      astrologerName: txn.astrologer?.name || txn.ai_astrologer?.name || null,
      createdAt: txn.created_at,
    }));

    // Calculate summary
    const summary = await prisma.wallettransaction.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    const creditSum = await prisma.wallettransaction.aggregate({
      where: { userId, isCredit: true },
      _sum: {
        amount: true,
      },
    });

    const debitSum = await prisma.wallettransaction.aggregate({
      where: { userId, isCredit: false },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        summary: {
          totalCredit: creditSum._sum.amount?.toString() || "0",
          totalDebit: debitSum._sum.amount?.toString() || "0",
          netAmount: summary._sum.amount?.toString() || "0",
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          perPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        message: error.message,
      },
      { status: 500 }
    );
  }
}