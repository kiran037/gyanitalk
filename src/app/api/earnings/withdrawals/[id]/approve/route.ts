// app/api/earnings/withdrawals/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { modifiedBy, notes } = body;

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    // Get withdrawal request
    const withdrawal = await prisma.withdrawrequest.findUnique({
      where: { id: parseInt(params.id) },
      include: { astrologer: true }
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal request not found' },
        { status: 404 }
      );
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Cannot approve withdrawal with status: ${withdrawal.status}` },
        { status: 400 }
      );
    }

    // Check astrologer balance
    const transactions = await prisma.wallettransaction.findMany({
      where: { astrologerId: withdrawal.astrologerId || undefined }
    });

    const balance = transactions.reduce((acc, t) => {
      return acc + (t.isCredit ? (t.amount || 0) : -(t.amount || 0));
    }, 0);

    const withdrawAmount = parseFloat(withdrawal.withdrawAmount?.toString() || '0');

    if (balance < withdrawAmount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Update withdrawal status to approved
    const updatedWithdrawal = await prisma.withdrawrequest.update({
      where: { id: parseInt(params.id) },
      data: {
        status: 'approved',
        modifiedBy: parseInt(modifiedBy)
      }
    });

    // Create debit transaction in wallet
    await prisma.wallettransaction.create({
      data: {
        amount: withdrawAmount,
        userId: withdrawal.astrologer?.userId || null,
        astrologerId: withdrawal.astrologerId || undefined,
        transactionType: 'withdrawal',
        isCredit: false,
        createdBy: parseInt(modifiedBy),
        modifiedBy: parseInt(modifiedBy)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal approved successfully',
      data: {
        ...updatedWithdrawal,
        id: updatedWithdrawal.id.toString(),
        astrologerId: updatedWithdrawal.astrologerId?.toString(),
        withdrawAmount: updatedWithdrawal.withdrawAmount?.toString()
      }
    });

  } catch (error) {
    console.error('Approve withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve withdrawal' },
      { status: 500 }
    );
  }
}