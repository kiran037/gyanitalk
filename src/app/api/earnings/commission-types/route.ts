// app/api/earnings/commission-types/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all commission types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where = activeOnly ? {
      isActive: true,
      isDelete: false
    } : {};

    const types = await prisma.commission_types.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: types.map(t => ({
        ...t,
        id: t.id.toString()
      }))
    });

  } catch (error) {
    console.error('Get commission types error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commission types' },
      { status: 500 }
    );
  }
}

// POST - Create new commission type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, createdBy } = body;

    if (!name || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'name and createdBy are required' },
        { status: 400 }
      );
    }

    const type = await prisma.commission_types.create({
      data: {
        name,
        isActive: true,
        isDelete: false,
        createdBy: parseInt(createdBy),
        modifiedBy: parseInt(createdBy)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...type,
        id: type.id.toString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create commission type error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create commission type' },
      { status: 500 }
    );
  }
}

// PATCH - Update commission type
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, isActive, modifiedBy } = body;

    if (!id || !modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'id and modifiedBy are required' },
        { status: 400 }
      );
    }

    const updateData: any = { modifiedBy: parseInt(modifiedBy) };
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;

    const type = await prisma.commission_types.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        ...type,
        id: type.id.toString()
      }
    });

  } catch (error) {
    console.error('Update commission type error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update commission type' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete commission type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const modifiedBy = searchParams.get('modifiedBy');

    if (!id || !modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'id and modifiedBy are required' },
        { status: 400 }
      );
    }

    await prisma.commission_types.update({
      where: { id: BigInt(id) },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy: parseInt(modifiedBy)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Commission type deleted successfully'
    });

  } catch (error) {
    console.error('Delete commission type error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete commission type' },
      { status: 500 }
    );
  }
}