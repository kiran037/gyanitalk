// app/api/landing/profile/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    // Extract token
    const token =
      request.cookies.get("token")?.value ||
      request.cookies.get("auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT
    let jwtPayload;
    try {
      jwtPayload = await verifyUserJWT(token);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    // Optional session check
    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) {
        return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
      }
    }

    const userId = BigInt(jwtPayload.userId);

    // Fetch data in parallel
    const [wallet, transactions, aggregates] = await Promise.all([
      prisma.user_wallets.findFirst({
        where: { userId },
        select: { amount: true },
      }),

      prisma.wallettransaction.findMany({
        where: { userId },
        take: 10,
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

      prisma.wallettransaction.groupBy({
        by: ["isCredit"],
        where: { userId },
        _sum: { amount: true },
      }),
    ]);

    // Calculate totals safely
    let totalCredited = 0;
    let totalDebited = 0;

    aggregates.forEach((agg) => {
      const sum = agg._sum.amount ?? 0;
      if (agg.isCredit) {
        totalCredited += Number(sum);
      } else {
        totalDebited += Number(sum);
      }
    });

    // Format response with safe date handling
    const responseData = {
      balance: Number(wallet?.amount ?? 0),
      total_credited: totalCredited,
      total_debited: totalDebited,
      recent_transactions: transactions.map((t) => ({
        id: Number(t.id),
        amount: Number(t.amount ?? 0),
        transactionType: t.transactionType ?? "Wallet Activity",
        isCredit: Boolean(t.isCredit),
        // Safe handling: if created_at is null (rare), fallback to current time
        created_at: t.created_at ? t.created_at.toISOString() : new Date().toISOString(),
        description:
          t.orderId
            ? `Order #${t.orderId}`
            : t.transaction_id
            ? `Ref: ${t.transaction_id}`
            : "Wallet transaction",
      })),
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Wallet API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}