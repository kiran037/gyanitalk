// app/api/support/faq/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all FAQ categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDelete: false,
    };

    if (search) {
      where.name = { contains: search };
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    // Get total count
    const total = await prisma.help_supports.count({ where });

    // Get categories with question count
    const categories = await prisma.help_supports.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: {
            subCategory: true,
            tickets: true,
          },
        },
      },
    });

    // Serialize BigInt
    const serializedCategories = categories.map((cat) => ({
      ...cat,
      id: cat.id.toString(),
      questionCount: cat._count.subCategory,
      ticketCount: cat._count.tickets,
    }));

    return NextResponse.json({
      success: true,
      data: serializedCategories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, isActive, createdBy } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.help_supports.findFirst({
      where: {
        name,
        isDelete: false,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.help_supports.create({
      data: {
        name,
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
        createdBy: createdBy || 1,
        modifiedBy: createdBy || 1,
      },
    });

    // Serialize BigInt
    const serializedCategory = {
      ...category,
      id: category.id.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: serializedCategory,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}