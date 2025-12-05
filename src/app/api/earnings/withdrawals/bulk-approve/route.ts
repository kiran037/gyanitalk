// app/api/earnings/withdrawals/bulk-approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { withdrawalIds, modifiedBy } = body;

    if (!modifiedBy || !withdrawalIds || !Array.isArray(withdrawalIds)) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy and withdrawalIds array are required' },
        { status: 400 }
      );
    }

    const results = {
      approved: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };

    // Process each withdrawal
    for (const id of withdrawalIds) {
      try {
        // Get withdrawal request
        const withdrawal = await prisma.withdrawrequest.findUnique({
          where: { id: parseInt(id) },
          include: { astrologer: true }
        });

        if (!withdrawal) {
          results.failed.push({ id, reason: 'Not found' });
          continue;
        }

      if (withdrawal.status !== "Pending") {
  results.failed.push({ id, reason: `Status is ${withdrawal.status}` });
  continue;
}


        // Check balance
        const transactions = await prisma.wallettransaction.findMany({
          where: { astrologerId: withdrawal.astrologerId || undefined }
        });

        const balance = transactions.reduce((acc, t) => {
          return acc + (t.isCredit ? (t.amount || 0) : -(t.amount || 0));
        }, 0);

        const withdrawAmount = parseFloat(withdrawal.withdrawAmount?.toString() || '0');

        if (balance < withdrawAmount) {
          results.failed.push({ id, reason: 'Insufficient balance' });
          continue;
        }

      await prisma.withdrawrequest.update({
  where: { id: parseInt(id) },
  data: {
    status: "Released", // ✅ enum
    modifiedBy: parseInt(modifiedBy),
  },
});


        // Create debit transaction
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

        results.approved.push(id);

      } catch (error) {
        console.error(`Failed to approve withdrawal ${id}:`, error);
        results.failed.push({ id, reason: 'Processing error' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Approved ${results.approved.length} withdrawals`,
      data: results
    });

  } catch (error) {
    console.error('Bulk approve error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk approval' },
      { status: 500 }
    );
  }
}