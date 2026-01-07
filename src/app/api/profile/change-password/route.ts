// app/api/profile/change-password/route.ts


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function getSession(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return await verifyUserJWT(token);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: "Password too short (min 6 chars)" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { id: BigInt(session.userId) },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Verify old password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
    }

    // Update to new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });

  } catch (error: any) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update password" }, { status: 500 });
  }
}