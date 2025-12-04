import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Bulk update products
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, action, value } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    const ids = productIds.map((id) => BigInt(id));
    let updateData: any = { updated_at: new Date() };

    switch (action) {
      case 'activate':
        updateData.isActive = true;
        break;
      case 'deactivate':
        updateData.isActive = false;
        break;
      case 'delete':
        updateData.isDelete = true;
        updateData.isActive = false;
        break;
      case 'feature':
        updateData.is_feature = true;
        break;
      case 'unfeature':
        updateData.is_feature = false;
        break;
      case 'bestseller':
        updateData.bestseller = true;
        break;
      case 'unbestseller':
        updateData.bestseller = false;
        break;
      case 'updateCategory':
        if (!value) {
          return NextResponse.json(
            { success: false, error: 'Category ID is required' },
            { status: 400 }
          );
        }
        updateData.productCategoryId = BigInt(value);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await prisma.astromall_products.updateMany({
      where: {
        id: { in: ids },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} products updated successfully`,
      count: result.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}