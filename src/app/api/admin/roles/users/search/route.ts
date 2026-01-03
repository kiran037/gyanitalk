import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const orConditions: any[] = [
      { name: { contains: query } },
      { contactNo: { contains: query } },
      { email: { contains: query } },
    ];

    // If query is numeric, allow ID search
    if (!isNaN(Number(query))) {
      orConditions.push({ id: BigInt(query) });
    }

    const users = await prisma.users.findMany({
      where: {
        isDelete: false,
        isActive: true,
        OR: orConditions,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      take: 10, // Limit results for performance
    });

    const formattedUsers = users.map((user) => ({
      id: user.id.toString(),
      name: user.name || "N/A",
      email: user.email || "N/A",
      contactNo: user.contactNo || "N/A",
      profile: user.profile || null,
      // Return currently assigned roles so UI can pre-fill checkboxes
      currentRoles: user.userRoles.map((ur) => ({
        roleId: ur.role.id.toString(),
        roleName: ur.role.name,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error: any) {
    console.error("Error searching users for roles:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}