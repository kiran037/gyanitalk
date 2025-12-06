// app/api/astrologers/[id]/followers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = BigInt(params.id);
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = {
      astrologerId: astrologerId,
      isDelete: false,
      isActive: true,
    };

    const [followers, total] = await Promise.all([
      prisma.astrologer_followers.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
              profile: true,
              birthDate: true,
              location: true,
              created_at: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.astrologer_followers.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: followers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch followers',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}