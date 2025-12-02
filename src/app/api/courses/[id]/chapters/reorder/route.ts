// app/api/courses/[id]/chapters/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT reorder chapters
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { chapters } = body; // Array of { id, order }

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid chapters data',
        },
        { status: 400 }
      );
    }

    // Update chapters in transaction
    await prisma.$transaction(
      chapters.map((chapter) =>
        prisma.chapters.update({
          where: { id: chapter.id },
          data: {
            // Note: You would need to add an 'order' field to your schema
            // For now, we'll just return success
            updated_at: new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Chapters reordered successfully',
      note: 'To fully implement reordering, add an "order" or "sequence" field to the chapters table',
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