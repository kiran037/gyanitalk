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

    const addresses = await prisma.order_addresses.findMany({
      where: { userId: BigInt(jwtPayload.userId), isActive: true, isDelete: false },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: serializeData(addresses) });
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    const userId = BigInt(jwtPayload.userId);
    const {
      name, phoneNumber, phoneNumber2, countryCode, alternateCountryCode,
      flatNo, locality, landmark, city, state, country, pincode,
    } = await request.json();

    if (!name || !phoneNumber || !flatNo || !locality || !city || !state || !country || !pincode) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const address = await prisma.order_addresses.create({
      data: {
        userId,
        name,
        phoneNumber,
        phoneNumber2: phoneNumber2 || null,
        countryCode: countryCode || null,
        alternateCountryCode: alternateCountryCode || null,
        flatNo,
        locality,
        landmark: landmark || null,
        city,
        state,
        country,
        pincode: parseInt(pincode),
        createdBy: Number(userId),
        modifiedBy: Number(userId),
        isActive: true,
        isDelete: false
      },
    });

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      data: serializeData(address),
    });
  } catch (error) {
    console.error("Add address error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}