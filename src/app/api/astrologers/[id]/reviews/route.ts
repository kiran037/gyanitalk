// app/api/astrologers/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = BigInt(params.id);
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const isPublic = searchParams.get('isPublic');

    const where: any = {
      astrologerId: astrologerId,
      isDelete: false,
    };

    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) {
        where.rating.gte = parseFloat(minRating);
      }
      if (maxRating) {
        where.rating.lte = parseFloat(maxRating);
      }
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    const [reviews, total] = await Promise.all([
      prisma.user_reviews.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.user_reviews.count({ where }),
    ]);

    // Calculate average rating and rating distribution
    const allReviews = await prisma.user_reviews.findMany({
      where: {
        astrologerId: astrologerId,
        isDelete: false,
      },
      select: {
        rating: true,
      },
    });

    const averageRating = allReviews.length
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    // Rating distribution
    const ratingDistribution = {
      5: allReviews.filter((r) => r.rating === 5).length,
      4: allReviews.filter((r) => r.rating === 4).length,
      3: allReviews.filter((r) => r.rating === 3).length,
      2: allReviews.filter((r) => r.rating === 2).length,
      1: allReviews.filter((r) => r.rating === 1).length,
    };

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: averageRating.toFixed(1),
        totalReviews: allReviews.length,
        ratingDistribution,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}