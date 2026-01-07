import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Search query (optional)
    const search = searchParams.get("search") || "";

    const roleIdBigInt = BigInt(roleId);

    // Verify role exists
    const role = await prisma.roles.findUnique({
      where: { id: roleIdBigInt },
    });

    if (!role || role.isDelete) {
      return NextResponse.json(
        { success: false, error: "Role not found" },
        { status: 404 }
      );
    }

    // Build where clause for user search
    const userWhereClause: any = {
      isDelete: false,
      isActive: true,
    };

    if (search) {
      userWhereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactNo: { contains: search } },
      ];
    }

    // Fetch users with this role
    const [users, totalCount] = await Promise.all([
      prisma.user_roles.findMany({
        where: {
          roleId: roleIdBigInt,
          user: userWhereClause,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
              profile: true,
              created_at: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.user_roles.count({
        where: {
          roleId: roleIdBigInt,
          user: userWhereClause,
        },
      }),
    ]);

    // Format response
    const formattedUsers = users.map((ur) => ({
      id: ur.user.id.toString(),
      name: ur.user.name || "N/A",
      email: ur.user.email || "N/A",
      contactNo: ur.user.contactNo || "N/A",
      profile: ur.user.profile || null,
      assignedAt: ur.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        role: {
          id: role.id.toString(),
          name: role.name,
          isLocked: ["astrologer", "user"].includes(role.name.toLowerCase()),
        },
        users: formattedUsers,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching users for role:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}