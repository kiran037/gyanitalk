// app/api/landing/profile/avatar/route.ts
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

/**
 * POST /api/landing/profile/avatar
 * Update profile picture path (after S3 upload)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get JWT Token (from cookie or header)
    const token =
      request.cookies.get("token")?.value ||
      request.cookies.get("auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify JWT
    let jwtPayload;
    try {
      jwtPayload = await verifyUserJWT(token);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 });
    }

    // 3. Verify Database Session (Security Check)
    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) {
        return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
      }
    }

    const userId = BigInt(jwtPayload.userId);

    // 4. Parse Body
    const body = await request.json();
    const { profilePath } = body;

    if (!profilePath || typeof profilePath !== 'string') {
      return NextResponse.json(
        { success: false, error: "Profile path is required" },
        { status: 400 }
      );
    }

    // 5. Update Database
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        profile: profilePath,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        profile: true,
        updated_at: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully",
      data: serializeData(updatedUser),
    });

  } catch (error) {
    console.error("Update avatar error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}