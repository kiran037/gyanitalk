import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

// Helper: Serialize BigInt/Decimal for JSON response
function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') return value.toString();
    return value;
  }));
}

export async function PATCH(request: NextRequest) {
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
    const body = await request.json();
    const { 
      name, 
      email, 
      contactNo, 
      countryCode,
      birthDate, 
      gender, 
      birthTime, 
      birthPlace, 
      location, 
      addressLine1 
    } = body;

    // 4. Check for Uniqueness (Email/Phone)
    // Only check if these fields are present in the update body
    if (email || contactNo) {
      const existingUser = await prisma.users.findFirst({
        where: {
          OR: [
            email ? { email } : {},
            contactNo ? { contactNo } : {}
          ],
          NOT: {
            id: userId // Exclude current user
          }
        },
        select: { email: true, contactNo: true }
      });

      if (existingUser) {
        if (email && existingUser.email === email) {
          return NextResponse.json({ success: false, error: "Email already in use" }, { status: 409 });
        }
        if (contactNo && existingUser.contactNo === contactNo) {
          return NextResponse.json({ success: false, error: "Mobile number already in use" }, { status: 409 });
        }
      }
    }

    // 5. Construct Update Data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (contactNo) updateData.contactNo = contactNo;
    if (countryCode) updateData.countryCode = countryCode;
    if (gender) updateData.gender = gender;
    
    // Date/Time handling
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (birthTime) updateData.birthTime = birthTime;

    // Location synonyms (Sync birthPlace and location columns)
    if (birthPlace) {
      updateData.birthPlace = birthPlace;
      updateData.location = birthPlace; 
    } else if (location) {
      updateData.location = location;
      updateData.birthPlace = location;
    }

    if (addressLine1) updateData.addressLine1 = addressLine1;

    updateData.updated_at = new Date();

    // 6. Perform Update
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully", 
      data: serializeData(updatedUser) 
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}