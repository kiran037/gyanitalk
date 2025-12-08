// app/api/astrologers/categories/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    return out;
  }
}

// PATCH - Reorder categories (update displayOrder)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories, modifiedBy } = body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { success: false, error: "categories array is required" },
        { status: 400 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "modifiedBy is required" },
        { status: 400 }
      );
    }

    for (const category of categories) {
      if (!category.id || category.displayOrder === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: "Each category must have id and displayOrder",
          },
          { status: 400 }
        );
      }
    }

    const updatePromises = categories.map((category: any) =>
      prisma.astrologer_categories.update({
        where: { id: BigInt(category.id) },
        data: {
          displayOrder: category.displayOrder,
          modifiedBy,
        },
      })
    );

    const results = await prisma.$transaction(updatePromises);

    const safe = convertPrismaTypes({
      success: true,
      message: `Successfully reordered ${results.length} category(s)`,
      data: results,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Failed to reorder categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reorder categories",
      },
      { status: 500 }
    );
  }
}