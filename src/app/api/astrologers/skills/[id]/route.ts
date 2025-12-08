// app/api/astrologers/skills/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // bigint -> string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal -> number
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  // Date -> ISO string
  if (obj instanceof Date) return obj.toISOString();

  // primitives
  if (typeof obj !== "object") return obj;

  // arrays
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  // objects: recurse
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get single skill by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const skillId = BigInt(rawId);

    const skill = await prisma.skills.findUnique({
      where: { id: skillId },
    });

    if (!skill || skill.isDelete) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    // Get usage count
    const usageCount = await prisma.astrologer_expertises.count({
      where: {
        skillId: skill.id,
        isDelete: false,
      },
    });

    // Get astrologer IDs using this skill
    const expertises = await prisma.astrologer_expertises.findMany({
      where: {
        skillId: skill.id,
        isDelete: false,
      },
      select: {
        astrologerId: true,
      },
      take: 10,
    });

    const astrologerIds = expertises.map((e) => e.astrologerId);

    const astrologers = await prisma.astrologers.findMany({
      where: {
        id: { in: astrologerIds },
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    const safeResponse = convertPrismaTypes({
      success: true,
      data: {
        ...skill,
        usageCount,
        astrologers,
      },
    });

    return NextResponse.json(safeResponse);
  } catch (error: any) {
    console.error("Error fetching skill:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch skill",
      },
      { status: 500 }
    );
  }
}

// PUT - Update skill
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const skillId = BigInt(rawId);
    const body = await req.json();
    const { name, displayOrder, isActive, modifiedBy } = body;

    const existingSkill = await prisma.skills.findUnique({
      where: { id: skillId },
    });

    if (!existingSkill || existingSkill.isDelete) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "modifiedBy is required" },
        { status: 400 }
      );
    }

    // Name change conflict check
    if (name && name !== existingSkill.name) {
      const nameConflict = await prisma.skills.findFirst({
        where: {
          name: name.trim(),
          isDelete: false,
          id: { not: skillId },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: "Skill with this name already exists" },
          { status: 409 }
        );
      }
    }

    const updatedSkill = await prisma.skills.update({
      where: { id: skillId },
      data: {
        ...(name && { name: name.trim() }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
        modifiedBy,
      },
    });

    const safeResponse = convertPrismaTypes({
      success: true,
      message: "Skill updated successfully",
      data: updatedSkill,
    });

    return NextResponse.json(safeResponse);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Skill with this name already exists" },
        { status: 409 }
      );
    }

    console.error("Error updating skill:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update skill",
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete skill
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const skillId = BigInt(rawId);
    const { searchParams } = new URL(req.url);
    const modifiedByStr = searchParams.get("modifiedBy");

    if (!modifiedByStr) {
      return NextResponse.json(
        { success: false, error: "modifiedBy is required as query parameter" },
        { status: 400 }
      );
    }

    const modifiedBy = parseInt(modifiedByStr, 10);

    const existingSkill = await prisma.skills.findUnique({
      where: { id: skillId },
    });

    if (!existingSkill || existingSkill.isDelete) {
      return NextResponse.json(
        { success: false, error: "Skill not found" },
        { status: 404 }
      );
    }

    // Check usage
    const usageCount = await prisma.astrologer_expertises.count({
      where: {
        skillId,
        isDelete: false,
      },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete skill. It is currently assigned to ${usageCount} astrologer(s)`,
          usageCount,
        },
        { status: 409 }
      );
    }

    const deletedSkill = await prisma.skills.update({
      where: { id: skillId },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy,
      },
    });

    const safeResponse = convertPrismaTypes({
      success: true,
      message: "Skill deleted successfully",
      data: deletedSkill,
    });

    return NextResponse.json(safeResponse);
  } catch (error: any) {
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete skill",
      },
      { status: 500 }
    );
  }
}