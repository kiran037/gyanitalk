// app/api/earnings/commissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all commission configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const astrologerId = searchParams.get('astrologerId');
    const commissionTypeId = searchParams.get('commissionTypeId');

    // Build where clause
    const where: any = {
      isActive: true,
      isDelete: false
    };

    if (astrologerId) where.astrologerId = BigInt(astrologerId);
    if (commissionTypeId) where.commissionTypeId = BigInt(commissionTypeId);

    const commissions = await prisma.commissions.findMany({
      where,
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
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: commissions.map(c => ({
        ...c,
        id: c.id.toString(),
        commissionTypeId: c.commissionTypeId.toString(),
        astrologerId: c.astrologerId?.toString(),
        commissionType: c.commissionType ? {
          ...c.commissionType,
          id: c.commissionType.id.toString()
        } : null,
        astrologer: c.astrologer ? {
          ...c.astrologer,
          id: c.astrologer.id.toString()
        } : null
      }))
    });

  } catch (error) {
    console.error('Get commissions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}

// POST - Create new commission configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      astrologerId, 
      commissionTypeId, 
      commission, 
      createdBy 
    } = body;

    if (!commissionTypeId || !commission || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newCommission = await prisma.commissions.create({
      data: {
        astrologerId: astrologerId ? BigInt(astrologerId) : null,
        commissionTypeId: BigInt(commissionTypeId),
        commission: parseFloat(commission),
        isActive: true,
        isDelete: false,
        createdBy: parseInt(createdBy),
        modifiedBy: parseInt(createdBy)
      },
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
        ...newCommission,
        id: newCommission.id.toString(),
        commissionTypeId: newCommission.commissionTypeId.toString(),
        astrologerId: newCommission.astrologerId?.toString(),
        commissionType: newCommission.commissionType ? {
          ...newCommission.commissionType,
          id: newCommission.commissionType.id.toString()
        } : null,
        astrologer: newCommission.astrologer ? {
          ...newCommission.astrologer,
          id: newCommission.astrologer.id.toString()
        } : null
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create commission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create commission' },
      { status: 500 }
    );
  }
}