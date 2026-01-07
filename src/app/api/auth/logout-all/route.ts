// src/app/api/auth/logout-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, clearAuthCookie } from "@/lib/auth/index";
import { deleteAllUserSessions } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete all sessions for this user
    const deletedCount = await deleteAllUserSessions(BigInt(session.userId));

    // Clear cookie
    const response = NextResponse.json({
      success: true,
      message: `Logged out from all devices (${deletedCount} sessions)`,
      sessionsCleared: deletedCount,
    });

    response.cookies.set(clearAuthCookie());

    return response;
  } catch (error: any) {
    console.error("Logout all error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout from all devices" },
      { status: 500 }
    );
  }
}