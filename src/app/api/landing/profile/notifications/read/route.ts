///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/profile/notifications/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

export async function PATCH(request: NextRequest) {
  try {
    // 1. Auth Check
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    const userId = BigInt(jwtPayload.userId);
    const { notificationIds, markAll } = await request.json();

    let count = 0;

    // 2. Update Logic
    if (markAll) {
      const result = await prisma.user_notifications.updateMany({
        where: { 
          userId: userId, 
          is_read: false // Only update unread ones
        },
        data: { 
          is_read: true, 
          updated_at: new Date() 
        }
      });
      count = result.count;
    } else if (notificationIds && Array.isArray(notificationIds)) {
      const ids = notificationIds.map((id: string | number) => BigInt(id));
      const result = await prisma.user_notifications.updateMany({
        where: { 
          userId: userId, 
          id: { in: ids } 
        },
        data: { 
          is_read: true,
          updated_at: new Date()
        }
      });
      count = result.count;
    } else {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${count} notifications marked as read` 
    });

  } catch (error) {
    console.error("Mark notifications read error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}