import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  ));
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || 
      request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } 
    catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    const userId = BigInt(jwtPayload.userId);
    const { searchParams } = new URL(request.url);

    // ✅ Tab Logic Restored
    const tab = searchParams.get("tab") || "today"; 
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    let whereClause: any = {
      userId,
      isDelete: false,
      isActive: true,
    };

    // ✅ Date Filtering
    if (tab === "today") {
      whereClause.created_at = { gte: todayStart };
    } else if (tab === "week") {
      whereClause.created_at = { gte: weekStart, lt: todayStart };
    } else if (tab === "earlier") {
      whereClause.created_at = { lt: weekStart };
    }

    const [notifications, unreadTotal] = await Promise.all([
      prisma.user_notifications.findMany({
        where: whereClause,
        take: limit,
        orderBy: { created_at: "desc" },
        include: { notification: true },
      }),
      // Total unread count (global, not just for this tab)
      prisma.user_notifications.count({ 
        where: { userId, is_read: false, isDelete: false, isActive: true } 
      }),
    ]);

    const formatted = notifications.map(n => ({
      id: n.id.toString(),
      title: n.title || n.notification?.title || "Notification",
      description: n.description || n.notification?.description || "",
      is_read: n.is_read,
      created_at: n.created_at ? n.created_at.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        notifications: serializeData(formatted),
        unread_count: unreadTotal,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || 
      request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } 
    catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    const userId = BigInt(jwtPayload.userId);
    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      await prisma.user_notifications.updateMany({
        where: { userId, is_read: false },
        data: { is_read: true },
      });
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      await prisma.user_notifications.updateMany({
        where: { 
          userId, 
          id: { in: notificationIds.map((id: string) => BigInt(id)) } 
        },
        data: { is_read: true },
      });
      return NextResponse.json({ success: true, message: "Selected marked as read" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}