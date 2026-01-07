
// ============================================
// app/api/landing/profile/preferences/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value || 
      request.headers.get("authorization")?.replace("Bearer ", "");
    if (!sessionToken) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = await verifySession(sessionToken);
    if (!session.valid || !session.userId) return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });

    // Get user preferences (this is a basic implementation)
    // You may want to create a separate user_preferences table
    const user = await prisma.users.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        user_device_details: {
          where: { isActive: true },
          select: { fcmToken: true },
        },
      },
    });

    const preferences = {
      notifications: {
        push: !!user?.user_device_details[0]?.fcmToken,
        email: true,
        sms: false,
      },
      language: "en",
      theme: "light",
    };

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value || 
      request.headers.get("authorization")?.replace("Bearer ", "");
    if (!sessionToken) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = await verifySession(sessionToken);
    if (!session.valid || !session.userId) return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });

    const preferences = await request.json();

    // Update preferences (placeholder implementation)
    // You should implement actual preference updates based on your requirements

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      data: preferences,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}