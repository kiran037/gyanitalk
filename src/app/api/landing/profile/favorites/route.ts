import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

// Helper: Serialize BigInt
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

    // 2. Fetch Favorites
    const favorites = await prisma.astrologer_followers.findMany({
      where: { 
        userId: BigInt(jwtPayload.userId), 
        isActive: true, 
        isDelete: false 
      },
      include: {
        astrologer: { 
          select: { 
            id: true, 
            name: true, 
            profileImage: true, 
            primarySkill: true, 
            charge: true 
          } 
        },
      },
    });

    return NextResponse.json({ success: true, data: serializeData(favorites) });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { astrologerId } = await request.json();
    if (!astrologerId) return NextResponse.json({ success: false, error: "Astrologer ID required" }, { status: 400 });

    const userId = BigInt(jwtPayload.userId);

    // 2. Check if already favorited/following
    const existing = await prisma.astrologer_followers.findFirst({
        where: { userId, astrologerId: BigInt(astrologerId), isDelete: false }
    });

    if(existing) {
        if(!existing.isActive) {
            // Re-activate if it was inactive
            const updated = await prisma.astrologer_followers.update({
                where: { id: existing.id },
                data: { isActive: true }
            });
            return NextResponse.json({ success: true, message: "Added to favorites", data: serializeData(updated) });
        }
        return NextResponse.json({ success: true, message: "Already in favorites", data: serializeData(existing) });
    }

    // 3. Create Favorite
    const favorite = await prisma.astrologer_followers.create({
      data: {
        userId,
        astrologerId: BigInt(astrologerId),
        createdBy: Number(userId),
        modifiedBy: Number(userId),
        isActive: true,
        isDelete: false
      },
    });

    return NextResponse.json({ success: true, message: "Added to favorites", data: serializeData(favorite) });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}