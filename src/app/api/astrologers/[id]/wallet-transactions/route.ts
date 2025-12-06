// app/api/astrologers/[id]/wallet-transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = BigInt(params.id);
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const transactionType = searchParams.get('transactionType');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const isCredit = searchParams.get('isCredit');

    const where: any = {
      astrologerId: astrologerId,
    };

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (isCredit !== null && isCredit !== undefined) {
      where.isCredit = isCredit === 'true';
    }

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) {
        where.created_at.gte = new Date(fromDate);
      }
      if (toDate) {
        where.created_at.lte = new Date(toDate);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.wallettransaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
          order_request: {
            select: {
              id: true,
              orderType: true,
              orderStatus: true,
              totalPayable: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.wallettransaction.count({ where }),
    ]);

    // Calculate wallet balance
    const allTransactions = await prisma.wallettransaction.findMany({
      where: { astrologerId: astrologerId },
      select: {
        amount: true,
        isCredit: true,
      },
    });

    const walletBalance = allTransactions.reduce((sum: number, transaction: any) => {
      return transaction.isCredit
        ? sum + (transaction.amount || 0)
        : sum - (transaction.amount || 0);
    }, 0);

    // Calculate total credit and debit
    const totalCredit = allTransactions
      .filter((t: any) => t.isCredit)
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const totalDebit = allTransactions
      .filter((t: any) => !t.isCredit)
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        walletBalance: walletBalance.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        totalDebit: totalDebit.toFixed(2),
      },
    });
  } catch (error: any) {
    console.error('Error fetching wallet transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch wallet transactions',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}