// app/api/pages/[id]/toggle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getPageId(context: RouteContext): Promise<number> {
  const { params } = context;       // params is a Promise
  const { id } = await params;      // unwrap it

  const pageId = Number(id);
  if (!Number.isInteger(pageId)) {
    throw new Error(`Invalid page ID: "${id}"`);
  }

  return pageId;
}

// PATCH /api/pages/[id]/toggle - Toggle isActive status
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const pageId = await getPageId(context);

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
  }
}
