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

export async function PATCH(request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    const addressId = BigInt(params.addressId);
    const updateData = await request.json();
    const userId = BigInt(jwtPayload.userId);

    const existingAddress = await prisma.order_addresses.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    const address = await prisma.order_addresses.update({
      where: { id: addressId },
      data: {
        ...updateData,
        pincode: updateData.pincode ? parseInt(updateData.pincode) : undefined,
        modifiedBy: Number(userId),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: serializeData(address),
    });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { addressId: string } }) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    const addressId = BigInt(params.addressId);
    const userId = BigInt(jwtPayload.userId);

    const result = await prisma.order_addresses.updateMany({
      where: { id: addressId, userId },
      data: { isDelete: true, isActive: false },
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}