// app/api/settings/horoscope-signs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all horoscope signs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where = activeOnly ? { isActive: true, isDelete: false } : { isDelete: false };

    const signs = await prisma.hororscope_signs.findMany({
      where,
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: signs,
      total: signs.length,
    });
  } catch (error: any) {
    console.error('Error fetching horoscope signs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch horoscope signs' },
      { status: 500 }
    );
  }
}

// POST - Create new horoscope sign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, image, displayOrder, isActive, createdBy, modifiedBy } = body;

    // Validation
    if (!name || !image) {
      return NextResponse.json(
        { success: false, error: 'Name and image are required' },
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
    const existing = await prisma.hororscope_signs.findFirst({
      where: { 
        name: name.trim(),
        isDelete: false 
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This horoscope sign already exists' },
        { status: 409 }
      );
    }

    const newSign = await prisma.hororscope_signs.create({
      data: {
        name: name.trim(),
        image,
        displayOrder: displayOrder || null,
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
        createdBy: parseInt(createdBy),
        modifiedBy: parseInt(modifiedBy),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Horoscope sign created successfully',
        data: newSign,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating horoscope sign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create horoscope sign' },
      { status: 500 }
    );
  }
}