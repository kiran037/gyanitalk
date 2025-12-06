// app/api/astrologers/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to make Prisma data JSON-safe
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

// 👇 Next 15 style: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get single category by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const categoryId = BigInt(id);

    const category = await prisma.astrologer_categories.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.isDelete) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const astrologersInCategory = await prisma.astrologers.findMany({
      where: {
        astrologerCategoryId: {
          contains: category.id.toString(),
        },
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        primarySkill: true,
        experienceInYears: true,
        charge: true,
        isVerified: true,
      },
      take: 20,
    });

    const astrologerCount = await prisma.astrologers.count({
      where: {
        astrologerCategoryId: {
          contains: category.id.toString(),
        },
        isDelete: false,
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      data: {
        ...category,
        astrologerCount,
        astrologers: astrologersInCategory,
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Failed to fetch category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch category",
      },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const categoryId = BigInt(id);

    const body = await req.json();
    const { name, image, displayOrder, isActive, modifiedBy } = body;

    const existingCategory = await prisma.astrologer_categories.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory || existingCategory.isDelete) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "modifiedBy is required" },
        { status: 400 }
      );
    }

    if (name && name !== existingCategory.name) {
      const nameConflict = await prisma.astrologer_categories.findFirst({
        where: {
          name: name.trim(),
          isDelete: false,
          id: { not: categoryId },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          {
            success: false,
            error: "Category with this name already exists",
          },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.astrologer_categories.update({
      where: { id: categoryId },
      data: {
        ...(name && { name: name.trim() }),
        ...(image !== undefined && { image }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
        modifiedBy,
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update category",
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete category
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const categoryId = BigInt(id);

    const { searchParams } = new URL(req.url);
    const modifiedBy = searchParams.get("modifiedBy");

    if (!modifiedBy) {
      return NextResponse.json(
        {
          success: false,
          error: "modifiedBy is required as query parameter",
        },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.astrologer_categories.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory || existingCategory.isDelete) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const usageCount = await prisma.astrologers.count({
      where: {
        astrologerCategoryId: {
          contains: categoryId.toString(),
        },
        isDelete: false,
      },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category. It is currently assigned to ${usageCount} astrologer(s)`,
          usageCount,
        },
        { status: 409 }
      );
    }

    const deletedCategory = await prisma.astrologer_categories.update({
      where: { id: categoryId },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy: parseInt(modifiedBy, 10),
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete category",
      },
      { status: 500 }
    );
  }
}