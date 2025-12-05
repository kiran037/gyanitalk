// app/api/earnings/withdrawals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all withdrawal requests with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const astrologerId = searchParams.get('astrologerId');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {
      isActive: 1,
      isDelete: 0
    };

    if (status) where.status = status;
    if (astrologerId) where.astrologerId = BigInt(astrologerId);
    if (paymentMethod) where.paymentMethod = parseInt(paymentMethod);
    
    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get total count
    const total = await prisma.withdrawrequest.count({ where });

    // Get paginated data
    const withdrawals = await prisma.withdrawrequest.findMany({
      where,
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
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Convert BigInt to string for JSON serialization
    const serializedData = withdrawals.map(w => ({
      ...w,
      id: w.id.toString(),
      astrologerId: w.astrologerId?.toString(),
      withdrawAmount: w.withdrawAmount?.toString(),
      astrologer: w.astrologer ? {
        ...w.astrologer,
        id: w.astrologer.id.toString()
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: serializedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

// POST - Create new withdrawal request (from admin for astrologer)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      astrologerId, 
      withdrawAmount, 
      paymentMethod,
      upiId,
      accountNumber,
      ifscCode,
      accountHolderName,
      createdBy 
    } = body;

    // Validate required fields
    if (!astrologerId || !withdrawAmount || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check astrologer balance
    const transactions = await prisma.wallettransaction.findMany({
      where: { astrologerId: BigInt(astrologerId) }
    });

    const balance = transactions.reduce((acc, t) => {
      return acc + (t.isCredit ? (t.amount || 0) : -(t.amount || 0));
    }, 0);

    if (balance < parseFloat(withdrawAmount)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawrequest.create({
      data: {
        astrologerId: BigInt(astrologerId),
        withdrawAmount: parseFloat(withdrawAmount),
        paymentMethod: paymentMethod ? parseInt(paymentMethod) : null,
        upiId,
        accountNumber,
        ifscCode,
        accountHolderName,
        status: 'pending',
        isActive: 1,
        isDelete: 0,
        createdBy: parseInt(createdBy),
        modifiedBy: parseInt(createdBy)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...withdrawal,
        id: withdrawal.id.toString(),
        astrologerId: withdrawal.astrologerId?.toString(),
        withdrawAmount: withdrawal.withdrawAmount?.toString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create withdrawal request' },
      { status: 500 }
    );
  }
}