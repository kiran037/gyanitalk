// src/app/api/auth/login/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signUserJWT, setAuthCookie } from "@/lib/auth/index";
import { createSession, extractDeviceInfo } from "@/lib/auth/session";
import {
  checkAccountLock,
  checkAccountStatus,
  incrementFailedAttempts,
  resetFailedAttempts,
  logLoginAttempt,
} from "@/lib/auth/security";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, remember } = body; // identifier can be email or contactNo

    // Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Email/Mobile and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or contactNo
    const user = await prisma.users.findFirst({
      where: {
        OR: [{ email: identifier }, { contactNo: identifier }],
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        password: true,
        account_status: true,
        isActive: true,
      },
    });

    if (!user || !user.password) {
      await logLoginAttempt(null, identifier, false, "password", request);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
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

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // Increment failed attempts
      const failResult = await incrementFailedAttempts(user.id);
      await logLoginAttempt(user.id, user.email || identifier, false, "password", request);

      if (failResult.locked) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many failed attempts. Account locked for 15 minutes",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Invalid credentials. ${failResult.attemptsLeft} attempts remaining`,
        },
        { status: 401 }
      );
    }

    // Reset failed attempts on success
    await resetFailedAttempts(user.id);

    // Log successful login
    await logLoginAttempt(user.id, user.email || identifier, true, "password", request);

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
    console.error("Password login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}