// src/app/api/auth/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/index";
import { getUserSessions } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all active sessions
    const sessions = await getUserSessions(BigInt(session.userId));

    // Format sessions for response
    const formattedSessions = sessions.map((s) => ({
      id: s.id.toString(),
      deviceId: s.device_id,
      ipAddress: s.ip_address,
      userAgent: s.user_agent,
      lastActivity: s.last_activity,
      createdAt: s.created_at,
      isCurrent: session.sessionId
        ? s.id.toString() === session.sessionId
        : false,
    }));

    return NextResponse.json({
      success: true,
      data: {
        sessions: formattedSessions,
        total: formattedSessions.length,
      },
    });
  } catch (error: any) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}