// app/api/landing/profile/wallet/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const sessionToken =
      request.cookies.get("session_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifySession(sessionToken);
    if (!session.valid || !session.userId) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const userId = BigInt(session.userId);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const type = searchParams.get("type"); // "credit" | "debit"
    const search = searchParams.get("search");

    const where: any = { userId };

    if (type === "credit" || type === "debit") {
      where.isCredit = type === "credit";
    }

    if (search) {
      where.OR = [
        { transactionType: { contains: search, mode: "insensitive" } },
        { transaction_id: { contains: search, mode: "insensitive" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.wallettransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          amount: true,
          transactionType: true,
          isCredit: true,
          created_at: true,
          orderId: true,
          transaction_id: true,
        },
      }),

      prisma.wallettransaction.count({ where }),
    ]);

    const formatted = transactions.map((t) => ({
      id: Number(t.id),
      amount: Number(t.amount ?? 0),
      transactionType: t.transactionType ?? "Wallet Activity",
      isCredit: Boolean(t.isCredit),
      created_at: t.created_at ? t.created_at.toISOString() : new Date().toISOString(),
      description:
        t.orderId
          ? `Order #${t.orderId}`
          : t.transaction_id
          ? `Ref: ${t.transaction_id}`
          : "Wallet transaction",
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Wallet transactions API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}