// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateOTP, sendOTP, checkOTPRateLimit } from "@/lib/auth/otp";
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

    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, an OTP has been sent",
      });
    }

    // Check OTP rate limit
    const rateLimit = await checkOTPRateLimit(contactNo, "password_reset");
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
    const otp = await generateOTP(contactNo, "password_reset", user.id);
    await sendOTP(contactNo, countryCode, otp, "password_reset");

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
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}