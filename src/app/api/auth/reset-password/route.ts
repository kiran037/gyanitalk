// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyOTP } from "@/lib/auth/otp";
import { deleteAllUserSessions } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactNo, countryCode, otp, newPassword } = body;

    // Validation
    if (!contactNo || !countryCode || !otp || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long",
        },
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

    // Verify OTP
    const otpVerification = await verifyOTP(contactNo, otp, "password_reset");
    if (!otpVerification.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        failed_login_attempts: 0,
        locked_until: null,
        account_status: "active",
      },
    });

    // Invalidate all user sessions (force re-login)
    await deleteAllUserSessions(user.id);

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please login with your new password",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}