// app/api/pages/[id]/toggle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/pages/[id]/toggle - Toggle isActive status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = parseInt(params.id);

    if (isNaN(pageId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid page ID',
        },
        { status: 400 }
      );
    }

    const page = await prisma.pages.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page not found',
        },
        { status: 404 }
      );
    }

    // Toggle isActive
    const updatedPage = await prisma.pages.update({
      where: { id: pageId },
      data: {
        isActive: !page.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Page ${updatedPage.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: updatedPage.id,
        isActive: updatedPage.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error toggling page status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to toggle page status',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}