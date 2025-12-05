import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single feedback by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    const feedback = await prisma.app_reviews.findFirst({
      where: {
        id,
        isDelete: false,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            profile: true,
            created_at: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update feedback (toggle active status)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const body = await request.json();
    const { isActive, modifiedBy } = body;

    // Check if feedback exists
    const existingFeedback = await prisma.app_reviews.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      modifiedBy,
      updated_at: new Date(),
    };

    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedFeedback = await prisma.app_reviews.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE feedback (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const { searchParams } = new URL(request.url);
    const modifiedBy = parseInt(searchParams.get('modifiedBy') || '0');

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    const existingFeedback = await prisma.app_reviews.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    await prisma.app_reviews.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}