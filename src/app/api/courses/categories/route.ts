// app/api/courses/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const categories = await prisma.categories.findMany({
      where: {
        name: {
          contains: search,
        },
      },
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required',
        },
        { status: 400 }
      );
    }

    const category = await prisma.categories.create({
      data: {
        name,
        image: image || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}