// app/api/earnings/reports/withdrawals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const astrologerId = searchParams.get('astrologerId');
    const format = searchParams.get('format') || 'json'; // json or csv

// Build where clause
const where: any = {
  isActive: 1,
  isDelete: 0
};

if (status) {
  const s = status.toLowerCase();

  if (s === "pending") where.status = "Pending";
  else if (s === "reject" || s === "rejected") where.status = "Reject";
  else if (s === "released" || s === "approved") where.status = "Released";
}


    if (status) where.status = status;
    if (astrologerId) where.astrologerId = BigInt(astrologerId);
    
    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get withdrawal data
    const withdrawals = await prisma.withdrawrequest.findMany({
      where,
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true
          }
        },
        withdrawmethod: {
          select: {
            id: true,
            method_name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Calculate summary
    const summary = {
      totalWithdrawals: withdrawals.length,
      totalAmount: withdrawals.reduce((acc, w) => 
        acc + parseFloat(w.withdrawAmount?.toString() || '0'), 0
      ),
      byStatus: withdrawals.reduce((acc, w) => {
        const status = w.status || 'unknown';
        if (!acc[status]) acc[status] = { count: 0, amount: 0 };
        acc[status].count += 1;
        acc[status].amount += parseFloat(w.withdrawAmount?.toString() || '0');
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    };

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'ID',
        'Astrologer Name',
        'Email',
        'Amount',
        'Status',
        'Payment Method',
        'UPI ID',
        'Account Number',
        'IFSC Code',
        'Account Holder',
        'Created At',
        'Updated At'
      ];

      const rows = withdrawals.map(w => [
        w.id.toString(),
        w.astrologer?.name || '',
        w.astrologer?.email || '',
        w.withdrawAmount?.toString() || '0',
        w.status || '',
        w.withdrawmethod?.method_name || '',
        w.upiId || '',
        w.accountNumber || '',
        w.ifscCode || '',
        w.accountHolderName || '',
        w.created_at?.toISOString() || '',
        w.updated_at?.toISOString() || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="withdrawals_${Date.now()}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      summary,
      data: withdrawals.map(w => ({
        ...w,
        id: w.id.toString(),
        astrologerId: w.astrologerId?.toString(),
        withdrawAmount: w.withdrawAmount?.toString(),
        astrologer: w.astrologer ? {
          ...w.astrologer,
          id: w.astrologer.id.toString()
        } : null
      }))
    });

  } catch (error) {
    console.error('Generate withdrawal report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}