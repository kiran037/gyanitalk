// app/api/astrologer-groups/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get Group Members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = BigInt(params.id);
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = {
      group_id: groupId,
    };

    const [members, total] = await Promise.all([
      prisma.astrologer_assign_group.findMany({
        where,
        skip,
        take: limit,
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
              profileImage: true,
              primarySkill: true,
              allSkill: true,
              languageKnown: true,
              experienceInYears: true,
              charge: true,
              videoCallRate: true,
              isVerified: true,
              isActive: true,
              chatStatus: true,
              callStatus: true,
              created_at: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.astrologer_assign_group.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group members',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Add Astrologers to Group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = BigInt(params.id);
    const body = await request.json();
    const { astrologerIds } = body; // Array of astrologer IDs

    if (!astrologerIds || !Array.isArray(astrologerIds) || astrologerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'astrologerIds array is required',
        },
        { status: 400 }
      );
    }

    // Check if group exists
    const group = await prisma.astrologer_groups.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    // Check which astrologers are already in the group
    const existingAssignments = await prisma.astrologer_assign_group.findMany({
      where: {
        group_id: groupId,
        astrologerId: {
          in: astrologerIds.map(id => BigInt(id)),
        },
      },
    });

    const existingAstrologerIds = existingAssignments.map(a => a.astrologerId?.toString()).filter(Boolean);
    const newAstrologerIds = astrologerIds.filter(id => !existingAstrologerIds.includes(id.toString()));

    if (newAstrologerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'All selected astrologers are already in this group',
        },
        { status: 400 }
      );
    }

    // Add astrologers to group
    const assignments = await Promise.all(
      newAstrologerIds.map((astrologerId) =>
        prisma.astrologer_assign_group.create({
          data: {
            group_id: groupId,
            astrologerId: BigInt(astrologerId),
          },
          include: {
            astrologer: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `${assignments.length} astrologer(s) added to group successfully`,
      data: assignments,
    });
  } catch (error: any) {
    console.error('Error adding astrologers to group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add astrologers to group',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}