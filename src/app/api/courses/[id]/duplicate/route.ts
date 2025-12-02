// app/api/courses/[id]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST duplicate course with all chapters
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);

    // Get original course with chapters
    const originalCourse = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        chapters: true,
      },
    });

    if (!originalCourse) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
        },
        { status: 404 }
      );
    }

    // Create duplicate course
    const duplicatedCourse = await prisma.courses.create({
      data: {
        name: `${originalCourse.name} (Copy)`,
        slug: `${originalCourse.slug}-copy-${Date.now()}`,
        metaTitle: originalCourse.metaTitle,
        metaDescription: originalCourse.metaDescription,
        metaKeywords: originalCourse.metaKeywords,
        canonicalUrl: originalCourse.canonicalUrl,
        ogTitle: originalCourse.ogTitle,
        ogDescription: originalCourse.ogDescription,
        ogImage: originalCourse.ogImage,
        twitterTitle: originalCourse.twitterTitle,
        twitterDescription: originalCourse.twitterDescription,
        twitterImage: originalCourse.twitterImage,
        schemaJson: originalCourse.schemaJson,
        price: originalCourse.price,
        offer_price: originalCourse.offer_price,
        description: originalCourse.description,
        image: originalCourse.image,
        is_paid: originalCourse.is_paid,
        category_id: originalCourse.category_id,
      },
    });

    // Duplicate chapters
    if (originalCourse.chapters && originalCourse.chapters.length > 0) {
      const chaptersData = originalCourse.chapters.map((chapter) => ({
        course_id: duplicatedCourse.id,
        title: chapter.title,
        description: chapter.description,
        pdf_type: chapter.pdf_type,
        pdf: chapter.pdf,
        image_type: chapter.image_type,
        image: chapter.image,
        video_type: chapter.video_type,
        video: chapter.video,
        video_format: chapter.video_format,
        is_paid: chapter.is_paid,
      }));

      await prisma.chapters.createMany({
        data: chaptersData,
      });
    }

    // Fetch the complete duplicated course
    const completeDuplicatedCourse = await prisma.courses.findUnique({
      where: { id: duplicatedCourse.id },
      include: {
        chapters: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: completeDuplicatedCourse,
      message: 'Course duplicated successfully',
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