import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all stories (last 24 hours only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const astrologerId = searchParams.get('astrologerId');

    const skip = (page - 1) * limit;

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const where: any = {
      created_at: {
        gte: twentyFourHoursAgo,
      },
    };

    if (astrologerId) {
      where.astrologerId = BigInt(astrologerId);
    }

    const [stories, total] = await Promise.all([
      prisma.astrologer_stories.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          story_view_count: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.astrologer_stories.count({ where }),
    ]);

    // Add view count and calculate remaining time
    const storiesWithMeta = stories.map(story => {
      const createdAt = new Date(story.created_at!);
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      const remainingMs = expiresAt.getTime() - Date.now();
      const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
      const remainingMinutes = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));

      return {
        ...story,
        viewCount: story.story_view_count.length,
        expiresAt: expiresAt.toISOString(),
        remainingTime: {
          hours: remainingHours,
          minutes: remainingMinutes,
          totalMinutes: Math.max(0, Math.floor(remainingMs / (1000 * 60))),
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: storiesWithMeta,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}