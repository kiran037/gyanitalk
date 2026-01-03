import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Assign roles to a user (Syncs roles: Add new, Remove missing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roleIds } = body; // roleIds should be an array of strings/numbers

    if (!userId || !Array.isArray(roleIds)) {
      return NextResponse.json(
        { success: false, error: "User ID and Role IDs array are required" },
        { status: 400 }
      );
    }

    const targetUserId = BigInt(userId);
    const targetRoleIds = roleIds.map((id) => BigInt(id));

    // Verify user exists
    const userExists = await prisma.users.findUnique({
      where: { id: targetUserId },
    });

    if (!userExists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // TRANSACTION: Delete existing roles -> Insert new roles
    await prisma.$transaction(async (tx) => {
      // 1. Remove all existing roles for this user
      await tx.user_roles.deleteMany({
        where: {
          userId: targetUserId,
        },
      });

      // 2. Assign the new list of roles
      if (targetRoleIds.length > 0) {
        // Prepare data for createMany
        const rolesData = targetRoleIds.map((roleId) => ({
          userId: targetUserId,
          roleId: roleId,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        await tx.user_roles.createMany({
          data: rolesData,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Roles updated successfully",
    });
  } catch (error: any) {
    console.error("Error assigning roles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign roles", details: error.message },
      { status: 500 }
    );
  }
}