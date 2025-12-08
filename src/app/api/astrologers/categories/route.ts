// app/api/astrologers/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe
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

// GET - List all astrologer categories with filters, search, pagination
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
    const sortOrder = (searchParams.get("sortOrder") || "asc") as
      | "asc"
      | "desc";

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
    const totalCount = await prisma.astrologer_categories.count({ where });

    // Get categories
    const categories = await prisma.astrologer_categories.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Get astrologer count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const astrologersWithCategory = await prisma.astrologers.count({
          where: {
            astrologerCategoryId: {
              contains: category.id.toString(),
            },
            isDelete: false,
          },
        });

        return {
          ...category,
          astrologerCount: astrologersWithCategory,
        };
      })
    );

    const safe = convertPrismaTypes({
      success: true,
      data: categoriesWithCount,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image, displayOrder, isActive, createdBy } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    if (!createdBy) {
      return NextResponse.json(
        { success: false, error: "createdBy is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.astrologer_categories.findFirst({
      where: {
        name: name.trim(),
        isDelete: false,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    const newCategory = await prisma.astrologer_categories.create({
      data: {
        name: name.trim(),
        image: image || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
        createdBy,
        modifiedBy: createdBy,
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });

    return NextResponse.json(safe, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create category",
      },
      { status: 500 }
    );
  }
}

// PATCH - Bulk actions (activate/deactivate/delete)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, categoryIds, modifiedBy } = body;

    if (!action || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request. action and categoryIds array required",
        },
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
          {
            success: false,
            error: "Invalid action. Use: activate, deactivate, or delete",
          },
          { status: 400 }
        );
    }

    const result = await prisma.astrologer_categories.updateMany({
      where: {
        id: { in: categoryIds.map((id: string | number | bigint) => BigInt(id)) },
        isDelete: false,
      },
      data: updateData,
    });

    const safe = convertPrismaTypes({
      success: true,
      message: `Successfully ${action}d ${result.count} category(s)`,
      count: result.count,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Failed to perform bulk action:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to perform bulk action",
      },
      { status: 500 }
    );
  }
}