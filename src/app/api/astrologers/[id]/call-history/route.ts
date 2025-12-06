// app/api/astrologers/[id]/call-history/route.ts
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
    const callStatus = searchParams.get('callStatus');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const callType = searchParams.get('callType'); // 0 = audio, 1 = video

    const where: any = {
      astrologerId: astrologerId,
    };

    if (callStatus) {
      where.callStatus = callStatus;
    }

    if (callType !== null && callType !== undefined) {
      where.call_type = parseInt(callType);
    }

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) {
        where.created_at.gte = new Date(fromDate);
      }
      if (toDate) {
        where.created_at.lte = new Date(toDate);
      }
    }

    const [callHistory, total] = await Promise.all([
      prisma.callrequest.findMany({
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
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.callrequest.count({ where }),
    ]);

    // Calculate total earnings from calls
    const totalEarnings = await prisma.callrequest.aggregate({
      where: { astrologerId: astrologerId },
      _sum: {
        deductionFromAstrologer: true,
      },
    });

    // Get call audio files if available
    const callsWithAudio = await Promise.all(
      callHistory.map(async (call) => {
        const audio = await prisma.callaudio.findFirst({
          where: { callId: call.id },
          select: {
            file: true,
            channelName: true,
          },
        });
        return {
          ...call,
          audioFile: audio?.file || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: callsWithAudio,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalEarnings: totalEarnings._sum.deductionFromAstrologer || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching call history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch call history',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}