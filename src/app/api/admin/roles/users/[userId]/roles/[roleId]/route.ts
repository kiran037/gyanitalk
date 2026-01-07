import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; roleId: string }> }
) {
  try {
    const { userId, roleId } = await params;
    const userIdBigInt = BigInt(userId);
    const roleIdBigInt = BigInt(roleId);

    // Fetch the role to check if it's locked
    const role = await prisma.roles.findUnique({
      where: { id: roleIdBigInt },
    });

    if (!role || role.isDelete) {
      return NextResponse.json(
        { success: false, error: "Role not found" },
        { status: 404 }
      );
    }

    // Prevent removal of locked roles
    const lockedRoles = ["astrologer", "user"];
    if (lockedRoles.includes(role.name.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot remove '${role.name}' role. This role is locked and can only be managed from the ${role.name} management page.`,
        },
        { status: 403 }
      );
    }

    // Check if user-role assignment exists
    const userRole = await prisma.user_roles.findFirst({
      where: {
        userId: userIdBigInt,
        roleId: roleIdBigInt,
      },
    });

    if (!userRole) {
      return NextResponse.json(
        { success: false, error: "User does not have this role" },
        { status: 404 }
      );
    }

    // Delete the user-role assignment
    await prisma.user_roles.delete({
      where: {
        id: userRole.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Role '${role.name}' removed from user successfully`,
    });
  } catch (error: any) {
    console.error("Error removing role from user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove role" },
      { status: 500 }
    );
  }
}