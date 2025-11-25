// app/api/landing/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Helper function to generate SEO metadata for courses
function generateCourseSEO(course: any) {
  const slug = course.slug || generateSlug(course.name);
  const defaultDescription = course.description || 
    `Learn ${course.name} with our comprehensive online course. ${course.is_paid ? 'Premium content' : 'Free access'} with expert guidance.`;
  
  const categoryName = course.category?.name || 'Astrology Courses';
  const priceText = course.is_paid 
    ? `₹${course.offer_price || course.price}` 
    : 'Free';
  
  return {
    slug,
    metaTitle: course.metaTitle || 
      `${course.name} | ${categoryName} - Online Course ${priceText}`,
    metaDescription: course.metaDescription || 
      `${defaultDescription.substring(0, 150)}... Enroll now at ${priceText}.`,
    metaKeywords: course.metaKeywords || 
      `${course.name}, ${categoryName}, online course, astrology learning, ${slug}`,
    canonicalUrl: course.canonicalUrl || `/landing/courses/${slug}`,
    ogTitle: course.ogTitle || `${course.name} | ${categoryName}`,
    ogDescription: course.ogDescription || defaultDescription,
    ogImage: course.ogImage || course.image,
    twitterTitle: course.twitterTitle || course.name,
    twitterDescription: course.twitterDescription || defaultDescription,
    twitterImage: course.twitterImage || course.image,
    schemaJson: course.schemaJson || JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Course",
      "name": course.name,
      "description": defaultDescription,
      "image": course.image,
      "provider": {
        "@type": "Organization",
        "name": "AstroGuru",
        "sameAs": "https://yourdomain.com"
      },
      "coursePrerequisites": categoryName,
      "offers": {
        "@type": "Offer",
        "price": course.offer_price || course.price || 0,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    })
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const categoryId = searchParams.get('categoryId');
    const isPaid = searchParams.get('isPaid');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};

    if (categoryId) {
      where.category_id = parseInt(categoryId);
    }

    if (isPaid !== null && isPaid !== undefined && isPaid !== '') {
      where.is_paid = parseInt(isPaid);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch courses with related data
    const [courses, totalCount] = await Promise.all([
      prisma.courses.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          chapters: {
            select: {
              id: true,
              title: true,
              is_paid: true,
            },
          },
          course_purchase: {
            select: {
              id: true,
              user_id: true,
              status: true,
            },
          },
        },
      }),
      prisma.courses.count({ where }),
    ]);

    // Generate SEO and format data for each course
    const coursesWithSEO = courses.map(course => {
      const seo = generateCourseSEO(course);
      
      // Calculate statistics
      const totalChapters = course.chapters.length;
      const freeChapters = course.chapters.filter(ch => ch.is_paid === 0).length;
      const paidChapters = course.chapters.filter(ch => ch.is_paid === 1).length;
      const totalEnrollments = course.course_purchase.length;
      const activeEnrollments = course.course_purchase.filter(cp => cp.status === 1).length;
      
      return {
        id: course.id,
        name: course.name,
        slug: seo.slug,
        description: course.description,
        image: course.image,
        price: course.price ? parseFloat(course.price.toString()) : null,
        offerPrice: course.offer_price ? parseFloat(course.offer_price.toString()) : null,
        isPaid: course.is_paid,
        category: course.category,
        statistics: {
          totalChapters,
          freeChapters,
          paidChapters,
          totalEnrollments,
          activeEnrollments,
        },
        seo: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          metaKeywords: seo.metaKeywords,
          canonicalUrl: seo.canonicalUrl,
          ogTitle: seo.ogTitle,
          ogDescription: seo.ogDescription,
          ogImage: seo.ogImage,
          twitterTitle: seo.twitterTitle,
          twitterDescription: seo.twitterDescription,
          twitterImage: seo.twitterImage,
          schemaJson: seo.schemaJson,
        },
        createdAt: course.created_at,
        updatedAt: course.updated_at,
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        courses: coursesWithSEO,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch courses',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}