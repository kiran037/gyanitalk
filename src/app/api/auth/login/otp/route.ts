// src/app/api/auth/login/otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateOTP, sendOTP, checkOTPRateLimit } from "@/lib/auth/otp";
import { checkAccountLock, checkAccountStatus } from "@/lib/auth/security";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactNo, countryCode } = body;

    // Validation
    if (!contactNo || !countryCode) {
      return NextResponse.json(
        { success: false, error: "Mobile number and country code are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.users.findFirst({
      where: { contactNo, countryCode, isDelete: false },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check account status
    const accountStatus = await checkAccountStatus(user.id);
    if (!accountStatus.active) {
      return NextResponse.json(
        { success: false, error: accountStatus.reason },
        { status: 403 }
      );
    }

    // Check if account is locked
    const lockStatus = await checkAccountLock(user.id);
    if (lockStatus.locked) {
      const minutes = Math.ceil(
        (lockStatus.unlockAt!.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          success: false,
          error: `Account is locked. Try again in ${minutes} minutes`,
        },
        { status: 429 }
      );
    }

    // Check OTP rate limit
    const rateLimit = await checkOTPRateLimit(contactNo, "login");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many OTP requests. Please try again in ${Math.ceil(rateLimit.retryAfter! / 60)} minutes`,
        },
        { status: 429 }
      );
    }

    // Generate and send OTP
    const otp = await generateOTP(contactNo, "login", user.id);
    await sendOTP(contactNo, countryCode, otp, "login");

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        contactNo,
        countryCode,
        expiresIn: 300, // 5 minutes
      },
    });
  } catch (error: any) {
    console.error("Login OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}