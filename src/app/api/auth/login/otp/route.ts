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

    // SANITIZATION: Get strictly the last 10 digits for DB lookup
    const cleanContactNo = contactNo.replace(/\D/g, "").slice(-10);

    // Find user (Using clean 10 digit number)
    const user = await prisma.users.findFirst({
      where: { contactNo: cleanContactNo, isDelete: false },
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
    const rateLimit = await checkOTPRateLimit(cleanContactNo, "login");
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
    // Pass clean number to DB, but send countryCode to helper for API usage
    const otp = await generateOTP(cleanContactNo, "login", user.id);
    await sendOTP(cleanContactNo, countryCode, otp, "login");

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        contactNo: cleanContactNo,
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