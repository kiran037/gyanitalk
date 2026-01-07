import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/roles/stats
 * Returns statistics for all roles with user counts
 * Locked roles: "astrologer" and "user" (cannot be modified)
 */
export async function GET(request: NextRequest) {
  try {
    const lockedRoleNames = ["astrologer", "user"];

    // Fetch all active roles with user count
    const roles = await prisma.roles.findMany({
      where: {
        isDelete: false,
        isActive: true,
      },
      include: {
        userRoles: {
          where: {
            user: {
              isDelete: false,
              isActive: true,
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format response with user counts and lock status
    const stats = roles.map((role) => ({
      id: role.id.toString(),
      name: role.name,
      userCount: role.userRoles.length,
      isLocked: lockedRoleNames.includes(role.name.toLowerCase()),
      createdAt: role.created_at,
    }));

    // Calculate totals
    const totalRoles = stats.length;
    const totalUsers = stats.reduce((sum, role) => sum + role.userCount, 0);
    const lockedRoles = stats.filter((r) => r.isLocked).length;

    return NextResponse.json({
      success: true,
      data: {
        roles: stats,
        summary: {
          totalRoles,
          totalUsers,
          lockedRoles,
          editableRoles: totalRoles - lockedRoles,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching role statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}