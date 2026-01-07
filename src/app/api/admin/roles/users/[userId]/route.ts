import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const userIdBigInt = BigInt(userId);

    // Fetch user with their roles
    const user = await prisma.users.findUnique({
      where: {
        id: userIdBigInt,
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        profile: true,
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                isActive: true,
                created_at: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Format roles
    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id.toString(),
      name: ur.role.name,
      isActive: ur.role.isActive,
      isLocked: ["astrologer", "user"].includes(ur.role.name.toLowerCase()),
      assignedAt: ur.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id.toString(),
          name: user.name || "N/A",
          email: user.email || "N/A",
          contactNo: user.contactNo || "N/A",
          profile: user.profile || null,
        },
        roles,
        totalRoles: roles.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user roles" },
      { status: 500 }
    );
  }
}