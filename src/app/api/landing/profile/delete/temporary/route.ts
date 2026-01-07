// app/api/landing/profile/delete/temporary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { softDeleteAccount } from "@/lib/profile/deletion";

/**
 * POST /api/landing/profile/delete/temporary
 * Soft delete account with 20-day grace period
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken =
      request.cookies.get("session_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifySession(sessionToken);
    if (!session.valid || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    // Soft delete account
    const result = await softDeleteAccount(session.userId);

    // Create response and clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Account temporarily deleted. You have 20 days to restore it.",
      data: {
        deleted_at: result.deleted_at,
        permanent_deletion_date: result.permanent_deletion_date,
        grace_period_days: result.grace_period_days,
      },
    });

    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    console.error("Temporary delete error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}