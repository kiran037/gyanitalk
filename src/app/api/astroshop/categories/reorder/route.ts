import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Reorder categories
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body; // Array of { id, displayOrder }

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Update all categories in a transaction
    const updates = categories.map((cat) =>
      prisma.product_categories.update({
        where: { id: BigInt(cat.id) },
        data: {
          displayOrder: cat.displayOrder,
          updated_at: new Date(),
        },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      success: true,
      message: 'Categories reordered successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}