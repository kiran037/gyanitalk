// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single course with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const { id } = await params;
const courseId = parseInt(id, 10);
if (Number.isNaN(courseId)) {
  return NextResponse.json({ success: false, error: 'Invalid course id' }, { status: 400 });
}



    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        chapters: {
          orderBy: {
            id: 'asc',
          },
        },
        course_purchase: {
          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            chapters: true,
            course_purchase: true,
          },
        },
      },
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

    // Calculate total revenue
    const totalRevenue = await prisma.course_purchase.aggregate({
      where: {
        course_id: courseId,
        status: 1,
      },
      _sum: {
        price: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        totalRevenue: totalRevenue._sum.price || 0,
      },
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

// PUT update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
const { id } = await params;
const courseId = parseInt(id, 10);
if (Number.isNaN(courseId)) {
  return NextResponse.json({ success: false, error: 'Invalid course id' }, { status: 400 });
}


    const body = await request.json();

    const {
      name,
      slug,
      price,
      offer_price,
      description,
      image,
      is_paid,
      category_id,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      schemaJson,
    } = body;

    const course = await prisma.courses.update({
      where: { id: courseId },
      data: {
        name,
        slug,
        price: price ? parseFloat(price) : null,
        offer_price: offer_price ? parseFloat(offer_price) : null,
        description,
        image,
        is_paid,
        category_id: category_id ? parseInt(category_id) : undefined,
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        twitterImage,
        schemaJson,
        updated_at: new Date(),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course updated successfully',
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

// DELETE course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const { id } = await params;
const courseId = parseInt(id, 10);
if (Number.isNaN(courseId)) {
  return NextResponse.json({ success: false, error: 'Invalid course id' }, { status: 400 });
}



    // Check if course has purchases
    const purchasesCount = await prisma.course_purchase.count({
      where: { course_id: courseId },
    });

    if (purchasesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete course with ${purchasesCount} purchases. Consider archiving instead.`,
        },
        { status: 400 }
      );
    }

    // Delete chapters first
    await prisma.chapters.deleteMany({
      where: { course_id: courseId },
    });

    // Delete course
    await prisma.courses.delete({
      where: { id: courseId },
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
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