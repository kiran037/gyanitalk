///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/admin/roles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all available roles
export async function GET(request: NextRequest) {
  try {
    const roles = await prisma.roles.findMany({
      where: {
        isDelete: false,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format BigInt to String for JSON
    const formattedRoles = roles.map((role) => ({
      id: role.id.toString(),
      name: role.name,
      isActive: role.isActive,
    }));

    return NextResponse.json({
      success: true,
      data: formattedRoles,
    });
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

// POST: Create a new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Role name is required" },
        { status: 400 }
      );
    }

    // Check for duplicate names
    const existingRole = await prisma.roles.findFirst({
      where: {
        name: body.name,
        isDelete: false,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: "Role already exists" },
        { status: 409 }
      );
    }

    const newRole = await prisma.roles.create({
      data: {
        name: body.name,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Role created successfully",
      data: {
        id: newRole.id.toString(),
        name: newRole.name,
      },
    });
  } catch (error: any) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create role" },
      { status: 500 }
    );
  }
}