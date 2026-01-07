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

    // 2. Parse Query Params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // 3. Fetch Call History
    const [calls, total] = await Promise.all([
      prisma.callrequest.findMany({
        where: { userId: userId },
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.callrequest.count({ where: { userId: userId } })
    ]);

    // 4. Format Data
    const formattedCalls = calls.map(call => ({
      id: call.id,
      astrologer: {
        id: call.astrologer?.id,
        name: call.astrologer?.name,
        profile: call.astrologer?.profileImage
      },
      status: call.callStatus,
      duration: call.call_duration, // Assuming string format like "5:00" or seconds
      deduction: call.deduction,
      rate: call.callRate,
      created_at: call.created_at
    }));

    return NextResponse.json({ 
      success: true, 
      data: serializeData(formattedCalls),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get call history error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}