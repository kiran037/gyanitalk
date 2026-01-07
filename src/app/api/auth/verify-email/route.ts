// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth/email";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Verify token
    const result = await verifyEmailToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, error: "Email verification failed" },
      { status: 500 }
    );
  }
}