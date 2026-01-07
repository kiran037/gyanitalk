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

    // 2. Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // 3. Fetch Data
    const [reviews, total] = await Promise.all([
      prisma.user_reviews.findMany({
        where: { userId: userId, isActive: true, isDelete: false },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          astrologer: { 
            select: { id: true, name: true, profileImage: true } 
          },
        },
      }),
      prisma.user_reviews.count({ 
        where: { userId: userId, isActive: true, isDelete: false } 
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { 
        reviews: serializeData(reviews), 
        pagination: { 
          total, 
          page, 
          limit, 
          totalPages: Math.ceil(total / limit) 
        } 
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}