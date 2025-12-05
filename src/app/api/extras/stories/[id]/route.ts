import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single story by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const story = await prisma.astrologer_stories.findUnique({
      where: { id },
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
            userId: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Calculate expiry info
    const createdAt = new Date(story.created_at!);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const remainingMs = expiresAt.getTime() - Date.now();
    const isExpired = remainingMs <= 0;

    return NextResponse.json({
      success: true,
      data: {
        ...story,
        viewCount: story.story_view_count.length,
        expiresAt: expiresAt.toISOString(),
        isExpired,
        remainingTime: {
          hours: Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60))),
          minutes: Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE story (hard delete since no isDelete field)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const existingStory = await prisma.astrologer_stories.findUnique({
      where: { id },
    });

    if (!existingStory) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Delete all view counts first (cascade)
    await prisma.story_view_counts.deleteMany({
      where: { storyId: id },
    });

    // Then delete the story
    await prisma.astrologer_stories.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}