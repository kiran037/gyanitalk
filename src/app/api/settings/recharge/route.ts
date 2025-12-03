// app/api/settings/recharge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all recharge amounts
export async function GET(req: NextRequest) {
  try {
    const rechargeAmounts = await prisma.rechargeamount.findMany({
      orderBy: {
        amount: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: rechargeAmounts,
      total: rechargeAmounts.length,
    });
  } catch (error: any) {
    console.error('Error fetching recharge amounts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recharge amounts' },
      { status: 500 }
    );
  }
}

// POST - Create new recharge amount
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, cashback } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (cashback < 0) {
      return NextResponse.json(
        { success: false, error: 'Cashback cannot be negative' },
        { status: 400 }
      );
    }

    // Check for duplicate amount
    const existing = await prisma.rechargeamount.findFirst({
      where: { amount: parseInt(amount) },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This recharge amount already exists' },
        { status: 409 }
      );
    }

    const newRecharge = await prisma.rechargeamount.create({
      data: {
        amount: parseInt(amount),
        cashback: cashback ? parseInt(cashback) : 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Recharge amount created successfully',
        data: newRecharge,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating recharge amount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create recharge amount' },
      { status: 500 }
    );
  }
}