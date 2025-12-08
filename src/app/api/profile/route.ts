// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

// Helper: Get user from JWT token
async function getUserFromRequest(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");
    
    // If not in header, try to get from cookies
    if (!token) {
      token = request.cookies.get("token")?.value;
    }

    if (!token) {
      return null;
    }

    const session = await verifyUserJWT(token);
    return session;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

// GET - Fetch current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getUserFromRequest(request);
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(session.userId);

    const user = await prisma.users.findUnique({
      where: { id: userId, isDelete: false },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        countryCode: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        gender: true,
        profile: true,
        addressLine1: true,
        addressLine2: true,
        location: true,
        pincode: true,
        isActive: true,
        created_at: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const safeData = convertPrismaTypes(user);

    return NextResponse.json({
      success: true,
      data: safeData,
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getUserFromRequest(request);
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(session.userId);
    const body = await request.json();

    // Fields that can be updated
    const {
      name,
      email,
      contactNo,
      countryCode,
      birthDate,
      birthTime,
      birthPlace,
      gender,
      profile,
      addressLine1,
      addressLine2,
      location,
      pincode,
    } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (contactNo !== undefined) updateData.contactNo = contactNo;
    if (countryCode !== undefined) updateData.countryCode = countryCode;
    if (birthDate !== undefined) updateData.birthDate = new Date(birthDate);
    if (birthTime !== undefined) updateData.birthTime = birthTime;
    if (birthPlace !== undefined) updateData.birthPlace = birthPlace;
    if (gender !== undefined) updateData.gender = gender;
    if (profile !== undefined) updateData.profile = profile;
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
    if (location !== undefined) updateData.location = location;
    if (pincode !== undefined) updateData.pincode = pincode;

    updateData.updated_at = new Date();

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        countryCode: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        gender: true,
        profile: true,
        addressLine1: true,
        addressLine2: true,
        location: true,
        pincode: true,
      },
    });

    const safeData = convertPrismaTypes(updatedUser);

    return NextResponse.json({
      success: true,
      data: safeData,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
        message: error.message,
      },
      { status: 500 }
    );
  }
}