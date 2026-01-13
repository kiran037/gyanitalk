///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/profile/kundali/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') return value.toString();
    return value;
  }));
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    // Schema Note: users.id is BigInt, but kundalis.createdBy is Int.
    // Ensure userId fits in Int, otherwise this query might fail or needs schema fix.
    const userId = Number(jwtPayload.userId);

    const kundalis = await prisma.kundalis.findMany({
      where: { 
        createdBy: userId, 
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