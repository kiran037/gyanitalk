// app/api/courses/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

/* ===================== GET single category ===================== */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return badRequest("Invalid category id");
    }

    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            price: true,
            is_paid: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ===================== PUT update category ===================== */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return badRequest("Invalid category id");
    }

    const body = await request.json();
    const { name, image } = body;

    const category = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name,
        image,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ===================== DELETE category ===================== */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return badRequest("Invalid category id");
    }

    const coursesCount = await prisma.courses.count({
      where: { category_id: categoryId },
    });

    if (coursesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category with ${coursesCount} courses. Please delete or reassign courses first.`,
        },
        { status: 400 }
      );
    }

    await prisma.categories.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}