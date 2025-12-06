// app/api/profile/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
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

// Helper: Get user from JWT token
async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      token = request.cookies.get("token")?.value;
    }

    if (!token) {
      return null;
    }

    const session = await verifyUserJWT(token);
    return session;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getUserFromRequest(request);
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(session.userId);

    // Fetch user activity stats
    const [
      totalOrders,
      totalPayments,
      totalWalletTransactions,
      walletBalance,
      totalReviews,
      totalTickets,
    ] = await Promise.all([
      // Total orders
      prisma.order_request.count({
        where: { userId, isDelete: "0" },
      }),
      
      // Total payments
      prisma.payment.count({
        where: { userId },
      }),
      
      // Total wallet transactions
      prisma.wallettransaction.count({
        where: { userId },
      }),
      
      // Wallet balance
      prisma.user_wallets.findFirst({
        where: { userId, isDelete: false },
        select: { amount: true },
      }),
      
      // Total reviews
      prisma.user_reviews.count({
        where: { userId, isDelete: false },
      }),
      
      // Total support tickets
      prisma.tickets.count({
        where: { userId, isDelete: false },
      }),
    ]);

    // Recent orders
    const recentOrders = await prisma.order_request.findMany({
      where: { userId, isDelete: "0" },
      select: {
        id: true,
        orderType: true,
        orderStatus: true,
        totalPayable: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: 5,
    });

    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        paymentMode: true,
        paymentStatus: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: 5,
    });

    const stats = {
      totalOrders,
      totalPayments,
      totalWalletTransactions,
      walletBalance: walletBalance?.amount || 0,
      totalReviews,
      totalTickets,
    };

    const safeData = convertPrismaTypes({
      stats,
      recentOrders,
      recentPayments,
    });

    return NextResponse.json({
      success: true,
      data: safeData,
    });
  } catch (error: any) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch activity",
        message: error.message,
      },
      { status: 500 }
    );
  }
}