// app/api/astrologers/[id]/gifts/route.ts
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

    // Filters
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {
      astrologerId: astrologerId,
      isDelete: false,
    };

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) {
        where.created_at.gte = new Date(fromDate);
      }
      if (toDate) {
        where.created_at.lte = new Date(toDate);
      }
    }

    const [gifts, total] = await Promise.all([
      prisma.astrologer_gifts.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
          gift: {
            select: {
              id: true,
              name: true,
              image: true,
              amount: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.astrologer_gifts.count({ where }),
    ]);

    // Calculate total gift amount received
    const totalGiftAmount = await prisma.astrologer_gifts.aggregate({
      where: {
        astrologerId: astrologerId,
        isDelete: false,
      },
      _sum: {
        giftAmount: true,
      },
    });

    // Get gift statistics
    const giftStats = await prisma.astrologer_gifts.groupBy({
      by: ['giftId'],
      where: {
        astrologerId: astrologerId,
        isDelete: false,
      },
      _count: {
        giftId: true,
      },
      _sum: {
        giftAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: gifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalGiftAmount: totalGiftAmount._sum.giftAmount || 0,
        totalGiftsReceived: total,
        giftBreakdown: giftStats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gifts',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}