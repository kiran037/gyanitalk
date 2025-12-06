// app/api/astrologers/[id]/notifications/route.ts
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

    // Get astrologer's userId
    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId },
      select: { userId: true },
    });

    if (!astrologer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Astrologer not found',
        },
        { status: 404 }
      );
    }

    // Get notifications for the astrologer's user account
    const where = {
      userId: astrologer.userId,
      isDelete: false,
    };

    const [notifications, total] = await Promise.all([
      prisma.user_notifications.findMany({
        where,
        skip,
        take: limit,
        include: {
          notification: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.user_notifications.count({ where }),
    ]);

    // Count unread notifications
    const unreadCount = await prisma.user_notifications.count({
      where: {
        userId: astrologer.userId,
        isDelete: false,
        is_read: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}