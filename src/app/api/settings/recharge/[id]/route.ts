// app/api/settings/recharge/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single recharge amount
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recharge = await prisma.rechargeamount.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!recharge) {
      return NextResponse.json(
        { success: false, error: 'Recharge amount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recharge,
    });
  } catch (error: any) {
    console.error('Error fetching recharge amount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recharge amount' },
      { status: 500 }
    );
  }
}

// PUT - Update recharge amount
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { amount, cashback } = body;

    // Check if exists
    const existing = await prisma.rechargeamount.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Recharge amount not found' },
        { status: 404 }
      );
    }

    // Validation
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    if (cashback !== undefined && cashback < 0) {
      return NextResponse.json(
        { success: false, error: 'Cashback cannot be negative' },
        { status: 400 }
      );
    }

    const updated = await prisma.rechargeamount.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(amount !== undefined && { amount: parseInt(amount) }),
        ...(cashback !== undefined && { cashback: parseInt(cashback) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Recharge amount updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating recharge amount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update recharge amount' },
      { status: 500 }
    );
  }
}

// DELETE - Delete recharge amount
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.rechargeamount.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Recharge amount not found' },
        { status: 404 }
      );
    }

    await prisma.rechargeamount.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Recharge amount deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting recharge amount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete recharge amount' },
      { status: 500 }
    );
  }
}