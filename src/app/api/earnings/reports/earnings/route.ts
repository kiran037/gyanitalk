// app/api/earnings/reports/earnings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const astrologerId = searchParams.get('astrologerId');
    const format = searchParams.get('format') || 'json';

    // Build date filter
    const dateFilter = startDate && endDate ? {
      created_at: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    // Get all astrologers or specific one
    const astrologerWhere = astrologerId ? {
      id: BigInt(astrologerId)
    } : {
      isActive: true,
      isDelete: false
    };

    const astrologers = await prisma.astrologers.findMany({
      where: astrologerWhere,
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true
      }
    });

    const earningsData = [];

    for (const astrologer of astrologers) {
      // Get wallet transactions (credits = earnings)
      const transactions = await prisma.wallettransaction.findMany({
        where: {
          astrologerId: astrologer.id,
          isCredit: true,
          ...dateFilter
        }
      });

      const totalEarnings = transactions.reduce((acc, t) => 
        acc + (t.amount || 0), 0
      );

      // Get withdrawals
      const withdrawals = await prisma.withdrawrequest.aggregate({
        where: {
          astrologerId: astrologer.id,
          status: 'approved',
          ...dateFilter
        },
        _sum: { withdrawAmount: true }
      });

      // Get commissions
      const commissions = await prisma.admin_get_commissions.aggregate({
        where: {
          commissions: {
            astrologerId: astrologer.id
          },
          ...dateFilter
        },
        _sum: { amount: true }
      });

      const totalWithdrawals = parseFloat(withdrawals._sum.withdrawAmount?.toString() || '0');
      const totalCommission = commissions._sum.amount || 0;
      const netEarnings = totalEarnings - totalCommission;
      const availableBalance = netEarnings - totalWithdrawals;

      earningsData.push({
        astrologerId: astrologer.id.toString(),
        name: astrologer.name,
        email: astrologer.email,
        contactNo: astrologer.contactNo,
        totalEarnings,
        totalCommission,
        netEarnings,
        totalWithdrawals,
        availableBalance,
        transactionCount: transactions.length
      });
    }

    if (format === 'csv') {
      const headers = [
        'Astrologer ID',
        'Name',
        'Email',
        'Contact',
        'Total Earnings',
        'Commission',
        'Net Earnings',
        'Withdrawals',
        'Available Balance',
        'Transaction Count'
      ];

      const rows = earningsData.map(e => [
        e.astrologerId,
        e.name,
        e.email || '',
        e.contactNo || '',
        e.totalEarnings.toFixed(2),
        e.totalCommission.toFixed(2),
        e.netEarnings.toFixed(2),
        e.totalWithdrawals.toFixed(2),
        e.availableBalance.toFixed(2),
        e.transactionCount.toString()
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="earnings_${Date.now()}.csv"`
        }
      });
    }

    // Calculate summary
    const summary = {
      totalAstrologers: earningsData.length,
      totalEarnings: earningsData.reduce((acc, e) => acc + e.totalEarnings, 0),
      totalCommission: earningsData.reduce((acc, e) => acc + e.totalCommission, 0),
      totalWithdrawals: earningsData.reduce((acc, e) => acc + e.totalWithdrawals, 0),
      totalAvailableBalance: earningsData.reduce((acc, e) => acc + e.availableBalance, 0)
    };

    return NextResponse.json({
      success: true,
      summary,
      data: earningsData
    });

  } catch (error) {
    console.error('Generate earnings report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate earnings report' },
      { status: 500 }
    );
  }
}