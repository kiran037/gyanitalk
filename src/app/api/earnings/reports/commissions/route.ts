// app/api/earnings/reports/commissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const astrologerId = searchParams.get('astrologerId');
    const commissionTypeId = searchParams.get('commissionTypeId');
    const format = searchParams.get('format') || 'json';

    // Build date filter
    const dateFilter = startDate && endDate ? {
      created_at: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    // Build where clause for admin_get_commissions
    const where: any = {
      isActive: true,
      isDelete: false,
      ...dateFilter
    };

    if (commissionTypeId) {
      where.commissionTypeId = BigInt(commissionTypeId);
    }

    // Get commission records
    const commissionRecords = await prisma.admin_get_commissions.findMany({
      where,
      include: {
        commission_types: {
          select: {
            id: true,
            name: true
          }
        },
        commissions: {
          include: {
            astrologer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Filter by astrologer if needed
    let filteredRecords = commissionRecords;
    if (astrologerId) {
      filteredRecords = commissionRecords.filter(r => 
        r.commissions?.astrologerId?.toString() === astrologerId
      );
    }

    // Calculate summary
    const summary = {
      totalCommissionRecords: filteredRecords.length,
      totalCommissionAmount: filteredRecords.reduce((acc, c) => acc + c.amount, 0),
      byType: filteredRecords.reduce((acc, c) => {
        const typeName = c.commission_types.name;
        if (!acc[typeName]) {
          acc[typeName] = { count: 0, amount: 0 };
        }
        acc[typeName].count += 1;
        acc[typeName].amount += c.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>),
      byAstrologer: filteredRecords.reduce((acc, c) => {
        const astrologerName = c.commissions?.astrologer?.name || 'Unknown';
        if (!acc[astrologerName]) {
          acc[astrologerName] = { count: 0, amount: 0 };
        }
        acc[astrologerName].count += 1;
        acc[astrologerName].amount += c.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    };

    if (format === 'csv') {
      const headers = [
        'ID',
        'Commission Type',
        'Astrologer Name',
        'Astrologer Email',
        'Amount',
        'Order ID',
        'Description',
        'Created At'
      ];

      const rows = filteredRecords.map(c => [
        c.id.toString(),
        c.commission_types.name,
        c.commissions?.astrologer?.name || '',
        c.commissions?.astrologer?.email || '',
        c.amount.toString(),
        c.orderId?.toString() || '',
        c.description || '',
        c.created_at?.toISOString() || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="commissions_${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      summary,
      data: filteredRecords.map(c => ({
        ...c,
        id: c.id.toString(),
        commissionTypeId: c.commissionTypeId.toString(),
        commissionId: c.commissionId?.toString(),
        commission_types: {
          ...c.commission_types,
          id: c.commission_types.id.toString()
        },
        commissions: c.commissions ? {
          ...c.commissions,
          id: c.commissions.id.toString(),
          astrologerId: c.commissions.astrologerId?.toString(),
          astrologer: c.commissions.astrologer ? {
            ...c.commissions.astrologer,
            id: c.commissions.astrologer.id.toString()
          } : null
        } : null
      }))
    });

  } catch (error) {
    console.error('Generate commission report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate commission report' },
      { status: 500 }
    );
  }
}