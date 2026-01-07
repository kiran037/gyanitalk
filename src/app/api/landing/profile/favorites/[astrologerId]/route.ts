import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

export async function DELETE(request: NextRequest, { params }: { params: { astrologerId: string } }) {
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

    // 2. Remove Favorite (Soft Delete)
    await prisma.astrologer_followers.updateMany({
      where: { 
        userId: BigInt(jwtPayload.userId), 
        astrologerId: BigInt(params.astrologerId) 
      },
      data: { isDelete: true, isActive: false },
    });

    return NextResponse.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}