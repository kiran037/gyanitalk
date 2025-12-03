// app/api/pages/[id]/restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/pages/[id]/restore - Restore soft-deleted page
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

    if (!page.isDelete) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page is not deleted',
        },
        { status: 400 }
      );
    }

    // Check if type already exists (another page might have been created with same type)
    if (page.type) {
      const typeExists = await prisma.pages.findFirst({
        where: {
          type: page.type,
          isDelete: false,
          id: { not: pageId },
        },
      });

      if (typeExists) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot restore: A page with type '${page.type}' already exists`,
          },
          { status: 409 }
        );
      }
    }

    // Restore page
    const restoredPage = await prisma.pages.update({
      where: { id: pageId },
      data: {
        isDelete: false,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Page restored successfully',
      data: restoredPage,
    });
  } catch (error: any) {
    console.error('Error restoring page:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to restore page',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}