// app/api/landing/profile/delete/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { restoreAccount, canRestoreAccount } from "@/lib/profile/deletion";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/landing/profile/delete/restore
 * Restore soft-deleted account
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.users.findFirst({
      where: { email, isDelete: false },
      select: { id: true, password: true, deleted_at: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account can be restored
    const canRestore = await canRestoreAccount(user.id);
    if (!canRestore.canRestore) {
      return NextResponse.json(
        { success: false, error: canRestore.reason },
        { status: 400 }
      );
    }

    // Restore account
    const result = await restoreAccount(user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account restored successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Restore account error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}