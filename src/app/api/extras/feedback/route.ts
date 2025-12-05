import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all feedback with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const appId = searchParams.get('appId');

    const skip = (page - 1) * limit;

    const where: any = {
      isDelete: false,
    };

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (appId) {
      where.appId = parseInt(appId);
    }

    if (search) {
      where.review = { contains: search };
    }

    const [feedbacks, total] = await Promise.all([
      prisma.app_reviews.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
              profile: true,
            },
          },
        },
      }),
      prisma.app_reviews.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}