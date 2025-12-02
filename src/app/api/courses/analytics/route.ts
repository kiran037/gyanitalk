// app/api/courses/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET courses analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (courseId) {
      // Get analytics for specific course
      const id = parseInt(courseId);

      const [course, purchases, totalRevenue] = await Promise.all([
        prisma.courses.findUnique({
          where: { id },
          include: {
            category: true,
            _count: {
              select: {
                chapters: true,
                course_purchase: true,
              },
            },
          },
        }),
        prisma.course_purchase.findMany({
          where: {
            course_id: id,
            status: 1,
          },
          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        }),
        prisma.course_purchase.aggregate({
          where: {
            course_id: id,
            status: 1,
          },
          _sum: {
            price: true,
          },
        }),
      ]);

      if (!course) {
        return NextResponse.json(
          {
            success: false,
            error: 'Course not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          course,
          totalEnrollments: purchases.length,
          totalRevenue: totalRevenue._sum.price || 0,
          recentPurchases: purchases.slice(0, 10),
        },
      });
    }

    // Get overall analytics
    const [
      totalCourses,
      totalCategories,
      totalPurchases,
      totalRevenue,
      topCourses,
      recentPurchases,
    ] = await Promise.all([
      prisma.courses.count(),
      prisma.categories.count(),
      prisma.course_purchase.count({
        where: { status: 1 },
      }),
      prisma.course_purchase.aggregate({
        where: { status: 1 },
        _sum: {
          price: true,
        },
      }),
      prisma.course_purchase.groupBy({
        by: ['course_id'],
        where: { status: 1 },
        _count: {
          course_id: true,
        },
        _sum: {
          price: true,
        },
        orderBy: {
          _count: {
            course_id: 'desc',
          },
        },
        take: 5,
      }),
      prisma.course_purchase.findMany({
        where: { status: 1 },
        include: {
          course: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
      }),
    ]);

    // Get course details for top courses
    const topCoursesWithDetails = await Promise.all(
      topCourses.map(async (item) => {
        const course = await prisma.courses.findUnique({
          where: { id: item.course_id },
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
          },
        });
        return {
          ...course,
          enrollments: item._count.course_id,
          revenue: item._sum.price || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          totalCategories,
          totalEnrollments: totalPurchases,
          totalRevenue: totalRevenue._sum.price || 0,
        },
        topCourses: topCoursesWithDetails,
        recentPurchases,
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