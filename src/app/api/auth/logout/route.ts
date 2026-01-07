// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, clearAuthCookie } from "@/lib/auth/index";
import { deleteSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (session?.sessionId) {
      // Delete session from database
      try {
        await deleteSession(session.sessionId);
      } catch (e) {
        console.error("Error deleting session:", e);
      }
    }

    // Clear cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
      cleared: true,
    });

    response.cookies.set(clearAuthCookie());

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Logout failed",
        cleared: false,
      },
      { status: 500 }
    );
  }
}