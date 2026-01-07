///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/profile/notifications/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyUserJWT } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }
    
    const preferences = {
      push_enabled: true,
      email_enabled: true,
      sms_enabled: false
    };

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error("Get notification settings error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: "Notification settings updated",
      data: body, // Echo back the data
    });
  } catch (error) {
    console.error("Update notification settings error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}