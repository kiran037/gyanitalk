import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: recursively convert BigInt -> string so JSON.stringify/NextResponse.json won't throw
function convertBigIntToString(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertBigIntToString);

  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertBigIntToString(v);
  }
  return out;
}


// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = (await params) as { id: string };
    const id = BigInt(idStr);


    const category = await prisma.product_categories.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            product: true,
          },
        },
      },
    });

    const safeCategory = convertBigIntToString(category);

    return NextResponse.json({
      success: true,
      data: safeCategory,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = (await params) as { id: string };
    const id = BigInt(idStr);

    const body = await request.json();
    const {
      name,
      categoryImage,
      displayOrder,
      isActive,
      modifiedBy,
    } = body;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (categoryImage !== undefined) updateData.categoryImage = categoryImage;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (modifiedBy !== undefined) updateData.modifiedBy = modifiedBy;

    const category = await prisma.product_categories.update({
      where: { id },
      data: updateData,
    });

    const safeCategory = convertBigIntToString(category);

    return NextResponse.json({
      success: true,
      data: safeCategory,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = (await params) as { id: string };
    const id = BigInt(idStr);


    const category = await prisma.product_categories.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
        updated_at: new Date(),
      },
    });

    const safeCategory = convertBigIntToString(category);

    return NextResponse.json({
      success: true,
      data: safeCategory,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}