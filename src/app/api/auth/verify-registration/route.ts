// src/app/api/auth/verify-registration/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth/otp";
import { signUserJWT, setAuthCookie } from "@/lib/auth/index";
import { createSession, extractDeviceInfo } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contactNo,
      countryCode,
      otp,
      name,
      birthDate,
      birthTime,
      birthPlace,
      gender, // ✅ Received from frontend
      email,
      profile // Received from frontend (S3 path)
    } = body;

    // Validation
    if (!contactNo || !countryCode || !otp || !name || !birthDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Required fields: contactNo, countryCode, otp, name, birthDate",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpVerification = await verifyOTP(contactNo, otp, "registration");
    if (!otpVerification.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { contactNo, countryCode },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 }
      );
    }

    const now = new Date();

    // Create user
    const user = await prisma.users.create({
      data: {
        name,
        contactNo,
        countryCode,
        birthDate: new Date(birthDate),
        birthTime: birthTime || "00:00",
        birthPlace: birthPlace || "", // ✅ Saving Location
        location: birthPlace || "",   // ✅ Saving to 'location' column as fallback
        gender: gender || null,       // ✅ Saving Gender
        email: email || null,
        profile: profile || null,
        phone_verified: true,
        phone_verified_at: now,
        account_status: "active",
        isActive: true,
        isDelete: false,
        created_at: now, // ✅ MANUALLY SETTING CREATED_AT
        updated_at: now,
      },
    });

    // Assign "user" role (roleId = 3)
    await prisma.user_roles.create({
      data: {
        userId: user.id,
        roleId: BigInt(3), 
        created_at: now,
      },
    });

    // Create wallet
    await prisma.user_wallets.create({
      data: {
        userId: user.id,
        amount: 0,
        createdBy: 0,
        modifiedBy: 0,
        created_at: now,
      },
    });

    // Create session
    const deviceInfo = extractDeviceInfo(request);
    const sessionToken = await createSession(user.id, deviceInfo);

    // Generate JWT
    const token = await signUserJWT(
      {
        userId: Number(user.id),
        email: user.email || "",
        name: user.name || "",
        loginAt: now.toISOString(),
        sessionId: sessionToken,
      },
      "30d"
    );

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          contactNo: user.contactNo,
        },
        token,
      },
    });

    response.cookies.set(setAuthCookie(token, true));

    return response;
  } catch (error: any) {
    console.error("Verify registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}