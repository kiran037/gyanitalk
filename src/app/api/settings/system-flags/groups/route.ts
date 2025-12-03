// app/api/settings/system-flags/groups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all flag groups with flag counts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const withFlags = searchParams.get('withFlags') === 'true';

    const where: any = {
      isDelete: '0',
    };

    if (activeOnly) {
      where.isActive = '1';
    }

    const groups = await prisma.flaggroup.findMany({
      where,
      include: {
        systemflags: withFlags
          ? {
              where: {
                isDelete: '0',
              },
              orderBy: {
                displayName: 'asc',
              },
            }
          : false,
        _count: {
          select: {
            systemflags: {
              where: {
                isDelete: '0',
              },
            },
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: groups,
      total: groups.length,
    });
  } catch (error: any) {
    console.error('Error fetching flag groups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flag groups' },
      { status: 500 }
    );
  }
}

// POST - Create new flag group
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flagGroupName, description, displayOrder, parentFlagGroupId, isActive, viewenable } =
      body;

    // Validation
    if (!flagGroupName) {
      return NextResponse.json(
        { success: false, error: 'Flag group name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await prisma.flaggroup.findFirst({
      where: {
        flagGroupName: flagGroupName.trim(),
        isDelete: '0',
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This flag group already exists' },
        { status: 409 }
      );
    }

    const newGroup = await prisma.flaggroup.create({
      data: {
        flagGroupName: flagGroupName.trim(),
        description: description || '',
        displayOrder: displayOrder || null,
        parentFlagGroupId: parentFlagGroupId || null,
        isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
        isDelete: 0,
        viewenable: viewenable !== undefined ? viewenable : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Flag group created successfully',
        data: newGroup,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating flag group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create flag group' },
      { status: 500 }
    );
  }
}