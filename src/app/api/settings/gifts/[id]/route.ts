// app/api/settings/gifts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single gift
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gift = await prisma.gifts.findFirst({
      where: {
        id: BigInt(params.id),
        isDelete: false,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { success: false, error: 'Gift not found' },
        { status: 404 }
      );
    }

    const giftData = {
      ...gift,
      id: gift.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: giftData,
    });
  } catch (error: any) {
    console.error('Error fetching gift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gift' },
      { status: 500 }
    );
  }
}

// PUT - Update gift
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, image, amount, displayOrder, isActive, modifiedBy } = body;

    // Check if exists
    const existing = await prisma.gifts.findFirst({
      where: {
        id: BigInt(params.id),
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Gift not found' },
        { status: 404 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'ModifiedBy is required' },
        { status: 400 }
      );
    }

    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const updateData: any = {
      modifiedBy: parseInt(modifiedBy),
      updated_at: new Date(),
    };

    if (name) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;
    if (amount) updateData.amount = parseFloat(amount);
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.gifts.update({
      where: { id: BigInt(params.id) },
      data: updateData,
    });

    const updatedData = {
      ...updated,
      id: updated.id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Gift updated successfully',
      data: updatedData,
    });
  } catch (error: any) {
    console.error('Error updating gift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gift' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete gift
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const modifiedBy = searchParams.get('modifiedBy');

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'ModifiedBy is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.gifts.findFirst({
      where: {
        id: BigInt(params.id),
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Gift not found' },
        { status: 404 }
      );
    }

    await prisma.gifts.update({
      where: { id: BigInt(params.id) },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy: parseInt(modifiedBy),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gift deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting gift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gift' },
      { status: 500 }
    );
  }
}