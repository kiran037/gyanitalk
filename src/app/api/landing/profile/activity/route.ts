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

    // 2. Query Params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
    const successParam = searchParams.get("success");
    const isSuccess = successParam === "true" ? true : successParam === "false" ? false : undefined;
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // 3. Build Filter
    const whereClause: any = { userId: userId };
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at.gte = startDate;
      if (endDate) whereClause.created_at.lte = endDate;
    }
    if (isSuccess !== undefined) {
      whereClause.success = isSuccess;
    }

    // 4. Fetch Data (Login Attempts)
    const [logs, total] = await Promise.all([
      prisma.login_attempts.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.login_attempts.count({ where: whereClause })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        logs: serializeData(logs),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    console.error("Get activity error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}