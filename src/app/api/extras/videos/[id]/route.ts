import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single video by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    const video = await prisma.astrology_videos.findFirst({
      where: {
        id,
        isDelete: false,
      },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update video
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const body = await request.json();
    const { youtubeLink, coverImage, videoTitle, isActive, modifiedBy } = body;

    // Check if video exists
    const existingVideo = await prisma.astrology_videos.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      modifiedBy,
      updated_at: new Date(),
    };

    if (youtubeLink !== undefined) updateData.youtubeLink = youtubeLink;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (videoTitle !== undefined) updateData.videoTitle = videoTitle;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedVideo = await prisma.astrology_videos.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedVideo,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE video (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const { searchParams } = new URL(request.url);
    const modifiedBy = parseInt(searchParams.get('modifiedBy') || '0');

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'modifiedBy is required' },
        { status: 400 }
      );
    }

    const existingVideo = await prisma.astrology_videos.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    await prisma.astrology_videos.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}