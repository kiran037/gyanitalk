import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all videos with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    const where: any = {
      isDelete: false,
    };

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.videoTitle = { contains: search };
    }

    const [videos, total] = await Promise.all([
      prisma.astrology_videos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.astrology_videos.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: videos,
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

// POST create new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeLink, coverImage, videoTitle, createdBy } = body;

    // Validation
    if (!youtubeLink || !coverImage || !videoTitle || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const video = await prisma.astrology_videos.create({
      data: {
        youtubeLink,
        coverImage,
        videoTitle,
        createdBy,
        modifiedBy: createdBy,
        isActive: true,
        isDelete: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Video created successfully',
      data: video,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}