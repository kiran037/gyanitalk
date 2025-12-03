// app/api/pages/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/pages/bulk - Bulk actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids } = body;

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Action and IDs array are required',
        },
        { status: 400 }
      );
    }

    const validActions = ['activate', 'deactivate', 'delete', 'restore'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
        },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let whereCondition: any = {
      id: { in: ids },
    };

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        whereCondition.isDelete = false; // Can't activate deleted pages
        break;
      case 'deactivate':
        updateData = { isActive: false };
        whereCondition.isDelete = false; // Can't deactivate deleted pages
        break;
      case 'delete':
        updateData = { isDelete: true, isActive: false };
        break;
      case 'restore':
        updateData = { isDelete: false, isActive: true };
        whereCondition.isDelete = true; // Only restore deleted pages
        break;
    }

    // Perform bulk update
    const result = await prisma.pages.updateMany({
      where: whereCondition,
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        affectedCount: result.count,
      },
    });
  } catch (error: any) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk action',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}