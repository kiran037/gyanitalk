// // app/api/earnings/astrologer/[id]/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAstrologerId(context: RouteContext): Promise<bigint> {
  const { id } = await context.params;
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid astrologer id: "${id}"`);
  }
  return BigInt(trimmed);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const astrologerId = await getAstrologerId(context);

    // All transactions for this astrologer
    const transactions = await prisma.wallettransaction.findMany({
      where: { astrologerId },
      orderBy: { created_at: "desc" },
    });

    // Balance from transactions (credits - debits)
    const balance = transactions.reduce((acc, t) => {
      const amount = t.amount || 0;
      return acc + (t.isCredit ? amount : -amount);
    }, 0);

    // Pending withdrawals
    const pendingWithdrawals = await prisma.withdrawrequest.aggregate({
      where: {
        astrologerId,
        status: "pending",
        isActive: 1,
        isDelete: 0,
      },
      _sum: { withdrawAmount: true },
    });

    const pendingAmount = parseFloat(
      pendingWithdrawals._sum.withdrawAmount?.toString() || "0"
    );
    const availableBalance = balance - pendingAmount;

    // Total earnings (sum of all credits)
    const totalEarnings = transactions
      .filter((t) => t.isCredit)
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    // Total withdrawals (sum of all debit "withdrawal")
    const totalWithdrawals = transactions
      .filter((t) => !t.isCredit && t.transactionType === "withdrawal")
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    // Astrologer details
    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        astrologer: astrologer
          ? {
              ...astrologer,
              id: astrologer.id.toString(),
            }
          : null,
        currentBalance: balance,
        pendingWithdrawals: pendingAmount,
        availableBalance,
        totalEarnings,
        totalWithdrawals,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
