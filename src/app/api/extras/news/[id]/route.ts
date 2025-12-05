import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single news by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    const news = await prisma.astrotalk_in_news.findFirst({
      where: {
        id,
        isDelete: false,
      },
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update news
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const body = await request.json();
    const { newsDate, channel, link, bannerImage, description, isActive, modifiedBy } = body;

    // Check if news exists
    const existingNews = await prisma.astrotalk_in_news.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
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

    if (newsDate !== undefined) updateData.newsDate = new Date(newsDate);
    if (channel !== undefined) updateData.channel = channel;
    if (link !== undefined) updateData.link = link;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedNews = await prisma.astrotalk_in_news.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'News updated successfully',
      data: updatedNews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE news (soft delete)
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

    const existingNews = await prisma.astrotalk_in_news.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    await prisma.astrotalk_in_news.update({
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
      message: 'News deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}