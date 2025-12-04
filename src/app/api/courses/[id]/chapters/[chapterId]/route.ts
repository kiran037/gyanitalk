// app/api/courses/[id]/chapters/[chapterId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single chapter
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const chapterId = parseInt(params.chapterId);

    const chapter = await prisma.chapters.findUnique({
      where: { id: chapterId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chapter not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT update chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const chapterId = parseInt(params.chapterId);
    const body = await request.json();

    const {
      title,
      description,
      pdf_type,
      pdf,
      image_type,
      image,
      video_type,
      video,
      video_format,
      is_paid,
    } = body;

    const chapter = await prisma.chapters.update({
      where: { id: chapterId },
      data: {
        title,
        description,
        pdf_type,
        pdf,
        image_type,
        image,
        video_type,
        video,
        video_format,
        is_paid,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: chapter,
      message: 'Chapter updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE chapter
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const chapterId = parseInt(params.chapterId);

    await prisma.chapters.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({
      success: true,
      message: 'Chapter deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}