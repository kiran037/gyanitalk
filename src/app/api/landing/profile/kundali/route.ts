import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

// Helper: Serialize BigInt for JSON response
function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') return value.toString();
    return value;
  }));
}

export async function GET(request: NextRequest) {
  try {
    // 1. Get JWT Token
    const token =
      request.cookies.get("token")?.value ||
      request.cookies.get("auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // 2. Verify JWT
    let jwtPayload;
    try {
      jwtPayload = await verifyUserJWT(token);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 });
    }

    // 3. Verify Session
    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    const userId = BigInt(jwtPayload.userId);

    // 4. Fetch Kundalis
    // Note: Schema says 'createdBy' is Int, but userId is BigInt. Casting to Number.
    const kundalis = await prisma.kundalis.findMany({
      where: { 
        createdBy: Number(userId), 
        isActive: true, 
        isDelete: false 
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ 
      success: true, 
      data: serializeData(kundalis) 
    });

  } catch (error) {
    console.error("Get kundali error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}