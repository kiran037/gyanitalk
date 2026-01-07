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

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params (Required in Next.js 15+)
    const params = await props.params;

    // 2. Get JWT Token
    const token =
      request.cookies.get("token")?.value ||
      request.cookies.get("auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 3. Verify JWT
    let jwtPayload;
    try {
      jwtPayload = await verifyUserJWT(token);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 });
    }

    // 4. Verify Session
    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) {
        return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
      }
    }

    // 5. Parse IDs
    const userId = Number(jwtPayload.userId); 
    const kundaliId = BigInt(params.id);

    // 6. Verify Ownership & Existence (Security Check)
    const existingKundali = await prisma.kundalis.findFirst({
      where: {
        id: kundaliId,
        createdBy: userId,
        isDelete: false,
      },
    });

    if (!existingKundali) {
      return NextResponse.json({ success: false, error: "Kundali not found" }, { status: 404 });
    }

    // 7. Soft Delete
    await prisma.kundalis.update({
      where: {
        id: kundaliId,
      },
      data: {
        isDelete: true,
        isActive: false,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Deleted successfully" 
    });

  } catch (error) {
    console.error("Delete kundali error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// Optional: GET single Kundali details
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params; // Await params here as well
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const jwtPayload = await verifyUserJWT(token);
    const userId = Number(jwtPayload.userId);
    const kundaliId = BigInt(params.id);

    const kundali = await prisma.kundalis.findFirst({
      where: {
        id: kundaliId,
        createdBy: userId,
        isDelete: false,
      },
    });

    if (!kundali) {
      return NextResponse.json({ success: false, error: "Kundali not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: serializeData(kundali) 
    });

  } catch (error) {
    console.error("Get single kundali error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}