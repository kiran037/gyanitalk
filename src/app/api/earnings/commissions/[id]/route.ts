// app/api/earnings/commissions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single commission configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commission = await prisma.commissions.findUnique({
      where: { id: BigInt(params.id) },
      include: {
        commissionType: {
          select: {
            id: true,
            name: true
          }
        },
        astrologer: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true
          }
        },
        admin_get_commissions: {
          where: {
            isActive: true,
            isDelete: false
          },
          take: 10,
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!commission) {
      return NextResponse.json(
        { success: false, error: 'Commission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...commission,
        id: commission.id.toString(),
        commissionTypeId: commission.commissionTypeId.toString(),
        astrologerId: commission.astrologerId?.toString(),
        commissionType: commission.commissionType ? {
          ...commission.commissionType,
          id: commission.commissionType.id.toString()
        } : null,
        astrologer: commission.astrologer ? {
          ...commission.astrologer,
          id: commission.astrologer.id.toString()
        } : null,
        admin_get_commissions: commission.admin_get_commissions.map(a => ({
          ...a,
          id: a.id.toString(),
          commissionTypeId: a.commissionTypeId.toString(),
          commissionId: a.commissionId?.toString()
        }))
      }
    });

  } catch (error) {
    console.error('Get commission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commission' },
      { status: 500 }
    );
  }
}

// PATCH - Update commission configuration
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { commission, isActive, modifiedBy } = body;

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    const updateData: any = { modifiedBy: parseInt(modifiedBy) };
    
    if (commission !== undefined) updateData.commission = parseFloat(commission);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCommission = await prisma.commissions.update({
      where: { id: BigInt(params.id) },
      data: updateData,
      include: {
        commissionType: true,
        astrologer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedCommission,
        id: updatedCommission.id.toString(),
        commissionTypeId: updatedCommission.commissionTypeId.toString(),
        astrologerId: updatedCommission.astrologerId?.toString(),
        commissionType: updatedCommission.commissionType ? {
          ...updatedCommission.commissionType,
          id: updatedCommission.commissionType.id.toString()
        } : null,
        astrologer: updatedCommission.astrologer ? {
          ...updatedCommission.astrologer,
          id: updatedCommission.astrologer.id.toString()
        } : null
      }
    });

  } catch (error) {
    console.error('Update commission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update commission' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete commission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const modifiedBy = searchParams.get('modifiedBy');

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    await prisma.commissions.update({
      where: { id: BigInt(params.id) },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy: parseInt(modifiedBy)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Commission deleted successfully'
    });

  } catch (error) {
    console.error('Delete commission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete commission' },
      { status: 500 }
    );
  }
}