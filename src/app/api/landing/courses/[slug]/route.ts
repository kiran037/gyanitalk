// app/api/landing/courses/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Helper function to generate comprehensive SEO metadata for course
function generateDetailedCourseSEO(course: any) {
  const slug = course.slug || generateSlug(course.name);
  const defaultDescription = course.description || 
    `Master ${course.name} with our comprehensive course. Includes ${course.chapters?.length || 0} chapters with detailed content.`;
  
  const categoryName = course.category?.name || 'Astrology Courses';
  const priceText = course.is_paid 
    ? (course.offer_price ? `₹${course.offer_price}` : `₹${course.price}`)
    : 'Free';
  
  const discount = course.price && course.offer_price 
    ? Math.round(((course.price - course.offer_price) / course.price) * 100)
    : 0;
  
  return {
    slug,
    metaTitle: course.metaTitle || 
      `${course.name} - Complete ${categoryName} Course | Learn Online ${priceText}`,
    metaDescription: course.metaDescription || 
      `${defaultDescription}. ${course.chapters?.length || 0} chapters covering everything you need. ${discount > 0 ? `Save ${discount}%!` : ''} Enroll now.`,
    metaKeywords: course.metaKeywords || 
      `${course.name}, ${categoryName}, online learning, course, chapters, ${slug}, astrology education`,
    canonicalUrl: course.canonicalUrl || `/landing/courses/${slug}`,
    ogTitle: course.ogTitle || `${course.name} | ${categoryName} Course`,
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
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": `PT${course.chapters?.length || 0}H`
      },
      "offers": {
        "@type": "Offer",
        "price": course.offer_price || course.price || 0,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      "aggregateRating": course.totalEnrollments > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": course.totalEnrollments
      } : undefined
    }, null, 2)
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;

    // Try to find course by slug first
    let course = await prisma.courses.findFirst({
      where: {
        slug: slug,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            image: true,
            created_at: true,
            updated_at: true,
          },
        },
        chapters: {
          orderBy: {
            id: 'asc',
          },
          select: {
            id: true,
            title: true,
            description: true,
            pdf_type: true,
            pdf: true,
            image_type: true,
            image: true,
            video_type: true,
            video: true,
            video_format: true,
            is_paid: true,
            created_at: true,
            updated_at: true,
          },
        },
        course_purchase: {
          select: {
            id: true,
            payment_id: true,
            user_id: true,
            status: true,
            price: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    // If not found by slug, try to find by generating slug from name
    if (!course) {
      const allCourses = await prisma.courses.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
              image: true,
              created_at: true,
              updated_at: true,
            },
          },
          chapters: {
            orderBy: {
              id: 'asc',
            },
            select: {
              id: true,
              title: true,
              description: true,
              pdf_type: true,
              pdf: true,
              image_type: true,
              image: true,
              video_type: true,
              video: true,
              video_format: true,
              is_paid: true,
              created_at: true,
              updated_at: true,
            },
          },
          course_purchase: {
            select: {
              id: true,
              payment_id: true,
              user_id: true,
              status: true,
              price: true,
              created_at: true,
              updated_at: true,
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      course = allCourses.find(c => generateSlug(c.name) === slug) || null;
    }

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
          message: `No course found with slug: ${slug}`,
        },
        { status: 404 }
      );
    }

    // Get related courses from same category
    const relatedCourses = await prisma.courses.findMany({
      where: {
        category_id: course.category_id,
        id: { not: course.id },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
        offer_price: true,
        description: true,
        is_paid: true,
      },
    });

    // Calculate comprehensive statistics
    const totalChapters = course.chapters.length;
    const freeChapters = course.chapters.filter(ch => ch.is_paid === 0).length;
    const paidChapters = course.chapters.filter(ch => ch.is_paid === 1).length;
    const totalEnrollments = course.course_purchase.length;
    const activeEnrollments = course.course_purchase.filter(cp => cp.status === 1).length;
    const totalRevenue = course.course_purchase
      .filter(cp => cp.status === 1)
      .reduce((sum, cp) => sum + (cp.price ? parseFloat(cp.price.toString()) : 0), 0);

    // Calculate discount percentage
    const discount = course.price && course.offer_price 
      ? Math.round(((parseFloat(course.price.toString()) - parseFloat(course.offer_price.toString())) 
          / parseFloat(course.price.toString())) * 100)
      : 0;

    // Format chapters with content details
    const formattedChapters = course.chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      isPaid: chapter.is_paid === 1,
      content: {
        pdf: chapter.pdf ? {
          type: chapter.pdf_type,
          url: chapter.pdf,
        } : null,
        image: chapter.image ? {
          type: chapter.image_type,
          url: chapter.image,
        } : null,
        video: chapter.video ? {
          type: chapter.video_type,
          url: chapter.video,
          format: chapter.video_format,
        } : null,
      },
      hasContent: !!(chapter.pdf || chapter.image || chapter.video),
      createdAt: chapter.created_at,
      updatedAt: chapter.updated_at,
    }));

    // Recent enrollments (last 5)
    const recentEnrollments = course.course_purchase
      .slice(0, 5)
      .map(cp => ({
        id: cp.id,
        userId: cp.user_id,
        price: cp.price ? parseFloat(cp.price.toString()) : null,
        status: cp.status === 1 ? 'active' : 'inactive',
        enrolledAt: cp.created_at,
      }));

    // Generate comprehensive SEO
    const seo = generateDetailedCourseSEO({
      ...course,
      totalEnrollments,
    });

    const response = {
      success: true,
      data: {
        course: {
          id: course.id,
          name: course.name,
          slug: seo.slug,
          description: course.description,
          image: course.image,
          price: course.price ? parseFloat(course.price.toString()) : null,
          offerPrice: course.offer_price ? parseFloat(course.offer_price.toString()) : null,
          discount,
          isPaid: course.is_paid,
          category: course.category,
          chapters: formattedChapters,
          statistics: {
            totalChapters,
            freeChapters,
            paidChapters,
            totalEnrollments,
            activeEnrollments,
            totalRevenue,
            conversionRate: totalEnrollments > 0 
              ? Math.round((activeEnrollments / totalEnrollments) * 100) 
              : 0,
          },
          recentEnrollments,
          createdAt: course.created_at,
          updatedAt: course.updated_at,
        },
        relatedCourses: relatedCourses.map(rc => ({
          id: rc.id,
          name: rc.name,
          slug: rc.slug || generateSlug(rc.name),
          image: rc.image,
          price: rc.price ? parseFloat(rc.price.toString()) : null,
          offerPrice: rc.offer_price ? parseFloat(rc.offer_price.toString()) : null,
          description: rc.description,
          isPaid: rc.is_paid,
        })),
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
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch course details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}