// app/api/earnings/payment-methods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all payment methods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where = activeOnly ? { isActive: true } : {};

    const methods = await prisma.withdrawmethods.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: methods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// POST - Create new payment method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method_name, method_id } = body;

    if (!method_name) {
      return NextResponse.json(
        { success: false, error: 'method_name is required' },
        { status: 400 }
      );
    }

    const method = await prisma.withdrawmethods.create({
      data: {
        method_name,
        method_id: method_id ? parseInt(method_id) : null,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: method
    }, { status: 201 });

  } catch (error) {
    console.error('Create payment method error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}

// PATCH - Update payment method
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, method_name, method_id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (method_name !== undefined) updateData.method_name = method_name;
    if (method_id !== undefined) updateData.method_id = parseInt(method_id);
    if (isActive !== undefined) updateData.isActive = isActive;

    const method = await prisma.withdrawmethods.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: method
    });

  } catch (error) {
    console.error('Update payment method error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment method
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    await prisma.withdrawmethods.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment method error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}