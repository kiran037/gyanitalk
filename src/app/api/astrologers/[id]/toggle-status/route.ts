// app/api/astrologers/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = BigInt(params.id);
    const body = await request.json();
    
    const { field, value } = body;
    
    // Validate field
    const allowedFields = [
      'isVerified',
      'isActive',
      'chatStatus',
      'callStatus',
      'isLiveOff',
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid field',
          message: `Field must be one of: ${allowedFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Check if astrologer exists
    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId },
    });

    if (!astrologer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Astrologer not found',
        },
        { status: 404 }
      );
    }

    // Update the field
    const updateData: any = {};
    
    if (field === 'isVerified' || field === 'isActive') {
      updateData[field] = Boolean(value);
    } else if (field === 'isLiveOff') {
      updateData[field] = value ? 1 : 0;
    } else {
      // For chatStatus and callStatus
      updateData[field] = value;
    }

    const updatedAstrologer = await prisma.astrologers.update({
      where: { id: astrologerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        isVerified: true,
        isActive: true,
        chatStatus: true,
        callStatus: true,
        isLiveOff: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${field} updated successfully`,
      data: updatedAstrologer,
    });
  } catch (error: any) {
    console.error('Error toggling astrologer status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update status',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}