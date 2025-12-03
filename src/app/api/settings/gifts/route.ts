// app/api/settings/gifts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all gifts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where = activeOnly ? { isActive: true, isDelete: false } : { isDelete: false };

    const gifts = await prisma.gifts.findMany({
      where,
      orderBy: {
        displayOrder: 'asc',
      },
    });

    // Convert BigInt to string
    const giftsData = gifts.map((gift) => ({
      ...gift,
      id: gift.id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: giftsData,
      total: giftsData.length,
    });
  } catch (error: any) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gifts' },
      { status: 500 }
    );
  }
}

// POST - Create new gift
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, image, amount, displayOrder, isActive, createdBy, modifiedBy } = body;

    // Validation
    if (!name || !amount) {
      return NextResponse.json(
        { success: false, error: 'Name and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    if (!createdBy || !modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'CreatedBy and ModifiedBy are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await prisma.gifts.findFirst({
      where: {
        name: name.trim(),
        isDelete: false,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This gift already exists' },
        { status: 409 }
      );
    }

    const newGift = await prisma.gifts.create({
      data: {
        name: name.trim(),
        image: image || null,
        amount: parseFloat(amount),
        displayOrder: displayOrder || null,
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
        createdBy: parseInt(createdBy),
        modifiedBy: parseInt(modifiedBy),
      },
    });

    const giftData = {
      ...newGift,
      id: newGift.id.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Gift created successfully',
        data: giftData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating gift:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gift' },
      { status: 500 }
    );
  }
}