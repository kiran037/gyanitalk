// app/api/astrologer-groups/[id]/members/[astrologerId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; astrologerId: string } }
) {
  try {
    const groupId = BigInt(params.id);
    const astrologerId = BigInt(params.astrologerId);

    const assignment = await prisma.astrologer_assign_group.findFirst({
      where: {
        group_id: groupId,
        astrologerId: astrologerId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Astrologer not found in this group',
        },
        { status: 404 }
      );
    }

    await prisma.astrologer_assign_group.delete({
      where: { id: assignment.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Astrologer removed from group successfully',
    });
  } catch (error: any) {
    console.error('Error removing astrologer from group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove astrologer from group',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}