// app/api/astrologers/skills/route.ts
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

// GET - List all skills with filters, search, pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "displayOrder";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

    // Build where clause
    const where: any = {
      isDelete: false,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    // Get total count
    const totalCount = await prisma.skills.count({ where });

    // Get skills
    const skills = await prisma.skills.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Get usage count for each skill
    const skillsWithUsage = await Promise.all(
      skills.map(async (skill) => {
        const usageCount = await prisma.astrologer_expertises.count({
          where: {
            skillId: skill.id,
            isDelete: false,
          },
        });

        return {
          ...skill,
          usageCount,
        };
      })
    );

    const safeResponse = convertPrismaTypes({
      success: true,
      data: skillsWithUsage,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

    return NextResponse.json(safeResponse);
  } catch (error: any) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch skills",
      },
      { status: 500 }
    );
  }
}

// POST - Create new skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayOrder, isActive, createdBy } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Skill name is required" },
        { status: 400 }
      );
    }

    if (!createdBy) {
      return NextResponse.json(
        { success: false, error: "createdBy is required" },
        { status: 400 }
      );
    }

    // Check if skill already exists
    const existingSkill = await prisma.skills.findFirst({
      where: {
        name: name.trim(),
        isDelete: false,
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        { success: false, error: "Skill with this name already exists" },
        { status: 409 }
      );
    }

    // Create skill
    const newSkill = await prisma.skills.create({
      data: {
        name: name.trim(),
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
        createdBy,
        modifiedBy: createdBy,
      },
    });

    const safeResponse = convertPrismaTypes({
      success: true,
      message: "Skill created successfully",
      data: newSkill,
    });

    return NextResponse.json(safeResponse, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Skill with this name already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating skill:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create skill",
      },
      { status: 500 }
    );
  }
}

// PATCH - Bulk actions (activate/deactivate/delete multiple skills)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, skillIds, modifiedBy } = body;

    if (!action || !skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid request. action and skillIds array required" },
        { status: 400 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "modifiedBy is required" },
        { status: 400 }
      );
    }

    let updateData: any = { modifiedBy };

    switch (action) {
      case "activate":
        updateData.isActive = true;
        break;
      case "deactivate":
        updateData.isActive = false;
        break;
      case "delete":
        updateData.isDelete = true;
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action. Use: activate, deactivate, or delete" },
          { status: 400 }
        );
    }

    // If ids in DB are BigInt, make sure you send them from frontend as numbers,
    // or convert here: id: { in: skillIds.map((id: string|number) => BigInt(id)) }
    const result = await prisma.skills.updateMany({
      where: {
        id: { in: skillIds },
        isDelete: false,
      },
      data: updateData,
    });

    const safeResponse = convertPrismaTypes({
      success: true,
      message: `Successfully ${action}d ${result.count} skill(s)`,
      count: result.count,
    });

    return NextResponse.json(safeResponse);
  } catch (error: any) {
    console.error("Error in skills bulk action:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to perform bulk action",
      },
      { status: 500 }
    );
  }
}