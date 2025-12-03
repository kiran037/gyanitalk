// app/api/settings/horoscope-signs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single horoscope sign
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sign = await prisma.hororscope_signs.findFirst({
      where: { 
        id: BigInt(params.id),
        isDelete: false 
      },
    });

    if (!sign) {
      return NextResponse.json(
        { success: false, error: 'Horoscope sign not found' },
        { status: 404 }
      );
    }

    // Convert BigInt to string for JSON serialization
    const signData = {
      ...sign,
      id: sign.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: signData,
    });
  } catch (error: any) {
    console.error('Error fetching horoscope sign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch horoscope sign' },
      { status: 500 }
    );
  }
}

// PUT - Update horoscope sign
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, image, displayOrder, isActive, modifiedBy } = body;

    // Check if exists
    const existing = await prisma.hororscope_signs.findFirst({
      where: { 
        id: BigInt(params.id),
        isDelete: false 
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Horoscope sign not found' },
        { status: 404 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'ModifiedBy is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.hororscope_signs.update({
      where: { id: BigInt(params.id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(image && { image }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
        modifiedBy: parseInt(modifiedBy),
        updated_at: new Date(),
      },
    });

    const updatedData = {
      ...updated,
      id: updated.id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Horoscope sign updated successfully',
      data: updatedData,
    });
  } catch (error: any) {
    console.error('Error updating horoscope sign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update horoscope sign' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete horoscope sign
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

    const existing = await prisma.hororscope_signs.findFirst({
      where: { 
        id: BigInt(params.id),
        isDelete: false 
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Horoscope sign not found' },
        { status: 404 }
      );
    }

    await prisma.hororscope_signs.update({
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
      message: 'Horoscope sign deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting horoscope sign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete horoscope sign' },
      { status: 500 }
    );
  }
}