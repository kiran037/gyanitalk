// app/api/settings/system-flags/by-group/[groupId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all flags for a specific group
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // First, verify the group exists
    const group = await prisma.flaggroup.findFirst({
      where: {
        id: parseInt(params.groupId),
        isDelete: '0',
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Flag group not found' },
        { status: 404 }
      );
    }

    const where: any = {
      flagGroupId: parseInt(params.groupId),
      isDelete: '0',
    };

    if (activeOnly) {
      where.isActive = '1';
    }

    const flags = await prisma.systemflag.findMany({
      where,
      orderBy: [
        { parent_id: 'asc' },
        { displayName: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        group: {
          id: group.id,
          flagGroupName: group.flagGroupName,
          description: group.description,
        },
        flags,
        total: flags.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching flags by group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flags by group' },
      { status: 500 }
    );
  }
}