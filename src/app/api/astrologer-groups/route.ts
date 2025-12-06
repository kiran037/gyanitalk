// app/api/astrologer-groups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - List all Astrologer Groups
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (search) {
      where.name = { contains: search };
    }

    const [groups, total] = await Promise.all([
      prisma.astrologer_groups.findMany({
        where,
        skip,
        take: limit,
        include: {
          astrologerassign: {
            include: {
              astrologer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  primarySkill: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.astrologer_groups.count({ where }),
    ]);

    // Format response with member count
    const groupsWithStats = groups.map((group) => ({
      ...group,
      memberCount: group.astrologerassign.length,
      members: group.astrologerassign.map((assign) => assign.astrologer),
      astrologerassign: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: groupsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching astrologer groups:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch astrologer groups',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new Astrologer Group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Group name is required',
        },
        { status: 400 }
      );
    }

    const newGroup = await prisma.astrologer_groups.create({
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Astrologer group created successfully',
      data: newGroup,
    });
  } catch (error: any) {
    console.error('Error creating astrologer group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create astrologer group',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}