// app/api/settings/system-flags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all system flags with optional filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const flagGroupId = searchParams.get('flagGroupId');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      isDelete: '0',
    };

    if (activeOnly) {
      where.isActive = '1';
    }

    if (flagGroupId) {
      where.flagGroupId = parseInt(flagGroupId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { displayName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const flags = await prisma.systemflag.findMany({
      where,
      include: {
        flagGroup: {
          select: {
            id: true,
            flagGroupName: true,
            description: true,
          },
        },
      },
      orderBy: [
        { flagGroupId: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: flags,
      total: flags.length,
    });
  } catch (error: any) {
    console.error('Error fetching system flags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system flags' },
      { status: 500 }
    );
  }
}

// POST - Create new system flag
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      displayName,
      value,
      valueType,
      flagGroupId,
      description,
      isActive,
      viewenable,
      parent_id,
    } = body;

    // Validation
    if (!name || !flagGroupId) {
      return NextResponse.json(
        { success: false, error: 'Name and flagGroupId are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name within same group
    const existing = await prisma.systemflag.findFirst({
      where: {
        name: name.trim(),
        flagGroupId: parseInt(flagGroupId),
        isDelete: '0',
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This flag already exists in the group' },
        { status: 409 }
      );
    }

    const newFlag = await prisma.systemflag.create({
      data: {
        name: name.trim(),
        displayName: displayName || name.trim(),
        value: value || '',
        valueType: valueType || 'text',
        flagGroupId: parseInt(flagGroupId),
        description: description || '',
        isActive: isActive !== undefined ? (isActive ? '1' : '0') : '1',
        isDelete: '0',
        viewenable: viewenable !== undefined ? viewenable : true,
        parent_id: parent_id || 0,
      },
      include: {
        flagGroup: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'System flag created successfully',
        data: newFlag,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating system flag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create system flag' },
      { status: 500 }
    );
  }
}