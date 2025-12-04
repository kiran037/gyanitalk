// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// GET all courses with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category_id');
    const isPaid = searchParams.get('is_paid');
    const sortBy = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    };

    if (categoryId) {
      where.category_id = parseInt(categoryId);
    }

    if (isPaid !== null && isPaid !== undefined && isPaid !== '') {
      where.is_paid = parseInt(isPaid);
    }

    const [courses, total] = await Promise.all([
      prisma.courses.findMany({
        where,
        include: {
          category: true,
          chapters: {
            select: {
              id: true,
              title: true,
            },
          },
          course_purchase: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              course_purchase: true,
            },
          },
        },
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take: limit,
      }),
      prisma.courses.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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

// POST create course
export async function POST(request: NextRequest) {
  try {
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

    if (!name || !category_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and category are required',
        },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const courseSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const course = await prisma.courses.create({
      data: {
        name,
        slug: courseSlug,
        price: price ? parseFloat(price) : null,
        offer_price: offer_price ? parseFloat(offer_price) : null,
        description,
        image,
        is_paid: is_paid || 0,
        category_id: parseInt(category_id),
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
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course created successfully',
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