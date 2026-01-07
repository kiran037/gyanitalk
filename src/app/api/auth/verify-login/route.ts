// src/app/api/auth/verify-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth/otp";
import { signUserJWT, setAuthCookie } from "@/lib/auth/index";
import { createSession, extractDeviceInfo } from "@/lib/auth/session";
import { resetFailedAttempts, logLoginAttempt } from "@/lib/auth/security";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactNo, countryCode, otp, remember } = body;

    // Validation
    if (!contactNo || !countryCode || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: "Mobile number, country code, and OTP are required",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.users.findFirst({
      where: { contactNo, countryCode, isDelete: false },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        account_status: true,
        isActive: true,
      },
    });

    if (!user) {
      await logLoginAttempt(null, contactNo, false, "otp", request);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify OTP
    const otpVerification = await verifyOTP(contactNo, otp, "login");
    if (!otpVerification.valid) {
      await logLoginAttempt(user.id, user.email || contactNo, false, "otp", request);
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Reset failed attempts
    await resetFailedAttempts(user.id);

    // Log successful login
    await logLoginAttempt(user.id, user.email || contactNo, true, "otp", request);

    // Create session
    const deviceInfo = extractDeviceInfo(request);
    const sessionToken = await createSession(user.id, deviceInfo);

    // Generate JWT
    const loginAt = new Date().toISOString();
    const ttl = remember ? "30d" : "24h";
    const token = await signUserJWT(
      {
        userId: Number(user.id),
        email: user.email || "",
        name: user.name || "",
        loginAt,
        sessionId: sessionToken,
      },
      ttl
    );

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
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

    response.cookies.set(setAuthCookie(token, remember || false));

    return response;
  } catch (error: any) {
    console.error("Verify login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}