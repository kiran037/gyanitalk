// app/api/earnings/withdrawals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single withdrawal request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const withdrawal = await prisma.withdrawrequest.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            profileImage: true
          }
        },
        withdrawmethod: {
          select: {
            id: true,
            method_name: true
          }
        }
      }
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...withdrawal,
        id: withdrawal.id.toString(),
        astrologerId: withdrawal.astrologerId?.toString(),
        withdrawAmount: withdrawal.withdrawAmount?.toString(),
        astrologer: withdrawal.astrologer ? {
          ...withdrawal.astrologer,
          id: withdrawal.astrologer.id.toString()
        } : null
      }
    });

  } catch (error) {
    console.error('Get withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawal' },
      { status: 500 }
    );
  }
}

// PATCH - Update withdrawal request (status, payment details, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      status,
      upiId,
      accountNumber,
      ifscCode,
      accountHolderName,
      paymentMethod,
      modifiedBy 
    } = body;

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = { modifiedBy: parseInt(modifiedBy) };
    
    if (status) updateData.status = status;
    if (upiId !== undefined) updateData.upiId = upiId;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (ifscCode !== undefined) updateData.ifscCode = ifscCode;
    if (accountHolderName !== undefined) updateData.accountHolderName = accountHolderName;
    if (paymentMethod !== undefined) updateData.paymentMethod = parseInt(paymentMethod);

    const withdrawal = await prisma.withdrawrequest.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...withdrawal,
        id: withdrawal.id.toString(),
        astrologerId: withdrawal.astrologerId?.toString(),
        withdrawAmount: withdrawal.withdrawAmount?.toString(),
        astrologer: withdrawal.astrologer ? {
          ...withdrawal.astrologer,
          id: withdrawal.astrologer.id.toString()
        } : null
      }
    });

  } catch (error) {
    console.error('Update withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update withdrawal' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete withdrawal request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const modifiedBy = searchParams.get('modifiedBy');

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    await prisma.withdrawrequest.update({
      where: { id: parseInt(params.id) },
      data: {
        isDelete: 1,
        isActive: 0,
        modifiedBy: parseInt(modifiedBy)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request deleted successfully'
    });

  } catch (error) {
    console.error('Delete withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete withdrawal' },
      { status: 500 }
    );
  }
}