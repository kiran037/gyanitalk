// app/api/astrologer-groups/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: BigInt / Decimal / Date → JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") return obj.toString();

  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  if (obj instanceof Date) return obj.toISOString();

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get Group Details
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Group ID is required" },
        { status: 400 }
      );
    }

    const groupId = BigInt(id);

    const group = await prisma.astrologer_groups.findUnique({
      where: { id: groupId },
      include: {
        astrologerassign: {
          include: {
            astrologer: {
              select: {
                id: true,
                name: true,
                email: true,
                contactNo: true,
                profileImage: true,
                primarySkill: true,
                allSkill: true,
                languageKnown: true,
                experienceInYears: true,
                charge: true,
                isVerified: true,
                isActive: true,
                chatStatus: true,
                callStatus: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          error: "Group not found",
        },
        { status: 404 }
      );
    }

    // Filter out any assignments where the astrologer might be null (deleted users)
    const validMembers = group.astrologerassign
      .map((assign) => assign.astrologer)
      .filter((member) => member !== null);

    const safe = convertPrismaTypes({
      success: true,
      data: {
        ...group,
        memberCount: validMembers.length,
        members: validMembers, // Return the clean list of members
        astrologerassign: undefined, // Hide the pivot table structure
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching group details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch group details",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH - Update Group Name
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Group ID is required" },
        { status: 400 }
      );
    }

    const groupId = BigInt(id);
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Group name is required",
        },
        { status: 400 }
      );
    }

    const updatedGroup = await prisma.astrologer_groups.update({
      where: { id: groupId },
      data: {
        name,
        updated_at: new Date(),
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Group updated successfully",
      data: updatedGroup,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update group",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete Group
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Group ID is required" },
        { status: 400 }
      );
    }

    const groupId = BigInt(id);

    // 1. First, delete entries from 'astrologer_assign_group'
    // This is the correct usage of the table you asked about
    await prisma.astrologer_assign_group.deleteMany({
      where: { group_id: groupId },
    });

    // 2. Then delete the group itself
    await prisma.astrologer_groups.delete({
      where: { id: groupId },
    });

    return NextResponse.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete group",
        message: error.message,
      },
      { status: 500 }
    );
  }
}