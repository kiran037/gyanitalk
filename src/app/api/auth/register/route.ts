// src/app/api/auth/register/route.ts
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

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { contactNo, countryCode },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists with this mobile number",
        },
        { status: 409 }
      );
    }

    // Check OTP rate limit
    const rateLimit = await checkOTPRateLimit(contactNo, "registration");
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
    const otp = await generateOTP(contactNo, "registration");
    await sendOTP(contactNo, countryCode, otp, "registration");

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
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}