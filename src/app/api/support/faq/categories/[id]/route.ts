// app/api/support/faq/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single category by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    const category = await prisma.help_supports.findUnique({
      where: { id },
      include: {
        subCategory: {
          where: { isDelete: false },
          orderBy: { created_at: "desc" },
        },
        _count: {
          select: {
            subCategory: true,
            tickets: true,
          },
        },
      },
    });

    if (!category || category.isDelete) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Serialize BigInt
    const serializedCategory = {
      ...category,
      id: category.id.toString(),
      subCategory: category.subCategory.map((q) => ({
        ...q,
        id: q.id.toString(),
        helpSupportId: q.helpSupportId.toString(),
      })),
      questionCount: category._count.subCategory,
      ticketCount: category._count.tickets,
    };

    return NextResponse.json({ success: true, data: serializedCategory });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH update category
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const body = await req.json();

    // Check if category exists
    const existingCategory = await prisma.help_supports.findUnique({
      where: { id },
    });

    if (!existingCategory || existingCategory.isDelete) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      modifiedBy: body.modifiedBy || 1,
    };

    if (body.name) updateData.name = body.name;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Update category
    const category = await prisma.help_supports.update({
      where: { id },
      data: updateData,
    });

    // Serialize BigInt
    const serializedCategory = {
      ...category,
      id: category.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedCategory,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE category (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    // Check if category exists
    const existingCategory = await prisma.help_supports.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subCategory: true,
            tickets: true,
          },
        },
      },
    });

    if (!existingCategory || existingCategory.isDelete) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has questions
    if (existingCategory._count.subCategory > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with existing questions. Please delete questions first.",
        },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.help_supports.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
      },
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