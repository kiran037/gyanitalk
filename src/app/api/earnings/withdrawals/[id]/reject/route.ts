// app/api/earnings/withdrawals/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { modifiedBy, reason } = body;

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    // Get withdrawal request
    const withdrawal = await prisma.withdrawrequest.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal request not found' },
        { status: 404 }
      );
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Cannot reject withdrawal with status: ${withdrawal.status}` },
        { status: 400 }
      );
    }

    // Update withdrawal status to rejected
    // Note: Store rejection reason in a note/comment field if needed
    const updatedWithdrawal = await prisma.withdrawrequest.update({
      where: { id: parseInt(params.id) },
      data: {
        status: 'rejected',
        modifiedBy: parseInt(modifiedBy)
        // You can add a rejection_reason field to schema if needed
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal rejected successfully',
      data: {
        ...updatedWithdrawal,
        id: updatedWithdrawal.id.toString(),
        astrologerId: updatedWithdrawal.astrologerId?.toString(),
        withdrawAmount: updatedWithdrawal.withdrawAmount?.toString(),
        rejectionReason: reason
      }
    });

  } catch (error) {
    console.error('Reject withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject withdrawal' },
      { status: 500 }
    );
  }
}