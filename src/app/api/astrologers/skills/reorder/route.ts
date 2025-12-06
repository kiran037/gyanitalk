// app/api/astrologers/skills/reorder/route.ts
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

// PATCH - Reorder skills (update displayOrder)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { skills, modifiedBy } = body;

    // Validation
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { success: false, error: "skills array is required" },
        { status: 400 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "modifiedBy is required" },
        { status: 400 }
      );
    }

    // Validate skills array structure
    for (const skill of skills) {
      if (!skill.id || skill.displayOrder === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: "Each skill must have id and displayOrder",
          },
          { status: 400 }
        );
      }
    }

    // Update all skills in transaction
    const updatePromises = skills.map((skill: any) =>
      prisma.skills.update({
        where: { id: BigInt(skill.id) },
        data: {
          displayOrder: skill.displayOrder,
          modifiedBy,
        },
      })
    );

    const results = await prisma.$transaction(updatePromises);

    const safeResponse = convertPrismaTypes({
      success: true,
      message: `Successfully reordered ${results.length} skill(s)`,
      data: results,
    });

    return NextResponse.json(safeResponse);
  } catch (error: any) {
    console.error("Failed to reorder skills:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reorder skills",
      },
      { status: 500 }
    );
  }
}