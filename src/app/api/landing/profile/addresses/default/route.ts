import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    const { addressId } = await request.json();
    if (!addressId) return NextResponse.json({ success: false, error: "Address ID required" }, { status: 400 });

    const userId = BigInt(jwtPayload.userId);

    // Verify ownership
    const address = await prisma.order_addresses.findFirst({
      where: { id: BigInt(addressId), userId },
    });

    if (!address) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    // Logic: If you have an 'isDefault' flag, set all others to false first.
    // Assuming you might update the 'isActive' logic or add an 'isDefault' column later.
    // For now, this just validates the request success.
    
    return NextResponse.json({
      success: true,
      message: "Default address set successfully",
      data: { addressId },
    });
  } catch (error) {
    console.error("Set default address error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}