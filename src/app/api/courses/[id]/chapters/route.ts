// app/api/courses/[id]/chapters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all chapters for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);

    const chapters = await prisma.chapters.findMany({
      where: {
        course_id: courseId,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: chapters,
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

// POST create chapter
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
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

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title is required',
        },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
        },
        { status: 404 }
      );
    }

    const chapter = await prisma.chapters.create({
      data: {
        course_id: courseId,
        title,
        description,
        pdf_type,
        pdf,
        image_type,
        image,
        video_type,
        video,
        video_format,
        is_paid: is_paid || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: chapter,
      message: 'Chapter created successfully',
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