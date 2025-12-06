// app/api/astrologers/[id]/chat-history/route.ts
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
    const chatStatus = searchParams.get('chatStatus');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {
      astrologerId: astrologerId,
    };

    if (chatStatus) {
      where.chatStatus = chatStatus;
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

    const [chatHistory, total] = await Promise.all([
      prisma.chatrequest.findMany({
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
      prisma.chatrequest.count({ where }),
    ]);

    // Calculate total earnings from chats
    const totalEarnings = await prisma.chatrequest.aggregate({
      where: { astrologerId: astrologerId },
      _sum: {
        deductionFromAstrologer: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: chatHistory,
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
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chat history',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}