// src/app/api/auth/send-verification-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/index";
import {
  generateEmailVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user email
    const user = await prisma.users.findUnique({
      where: { id: BigInt(session.userId) },
      select: { email: true, email_verified: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "No email address found" },
        { status: 400 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { success: false, error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = await generateEmailVerificationToken(
      BigInt(session.userId),
      user.email
    );

    // Send verification email
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error: any) {
    console.error("Send verification email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}