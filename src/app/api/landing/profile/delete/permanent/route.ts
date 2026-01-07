// app/api/landing/profile/delete/permanent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { permanentDeleteAccount } from "@/lib/profile/deletion";

/**
 * POST /api/landing/profile/delete/permanent
 * Permanently delete account immediately
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

    const { confirmation } = await request.json();

    // Require explicit confirmation
    if (confirmation !== "DELETE_MY_ACCOUNT") {
      return NextResponse.json(
        {
          success: false,
          error: "Please confirm deletion by sending: confirmation: 'DELETE_MY_ACCOUNT'",
        },
        { status: 400 }
      );
    }

    // Permanently delete account
    await permanentDeleteAccount(session.userId);

    // Create response and clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Account permanently deleted. This action cannot be undone.",
    });

    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    console.error("Permanent delete error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}