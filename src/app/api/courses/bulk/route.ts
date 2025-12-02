// app/api/courses/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, courseIds } = body;

    if (!action || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
        },
        { status: 400 }
      );
    }

    const ids = courseIds.map((id) => parseInt(id));

    switch (action) {
      case 'delete':
        // Check for purchases
        const purchasesCount = await prisma.course_purchase.count({
          where: {
            course_id: {
              in: ids,
            },
          },
        });

        if (purchasesCount > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot delete courses with ${purchasesCount} total purchases`,
            },
            { status: 400 }
          );
        }

        // Delete chapters first
        await prisma.chapters.deleteMany({
          where: {
            course_id: {
              in: ids,
            },
          },
        });

        // Delete courses
        const deleteResult = await prisma.courses.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: `${deleteResult.count} courses deleted successfully`,
        });

      case 'update_category':
        const { categoryId } = body;

        if (!categoryId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Category ID is required',
            },
            { status: 400 }
          );
        }

        const updateResult = await prisma.courses.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            category_id: parseInt(categoryId),
            updated_at: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `${updateResult.count} courses updated successfully`,
        });

      case 'make_paid':
        await prisma.courses.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            is_paid: 1,
            updated_at: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Courses marked as paid successfully',
        });

      case 'make_free':
        await prisma.courses.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            is_paid: 0,
            price: null,
            offer_price: null,
            updated_at: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Courses marked as free successfully',
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
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