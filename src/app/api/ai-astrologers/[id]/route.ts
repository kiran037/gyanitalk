// app/api/ai-astrologers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get AI Astrologer Details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const aiAstrologerId = BigInt(params.id);

    const aiAstrologer = await prisma.aiastrologers.findUnique({
      where: { id: aiAstrologerId },
      include: {
        aiChatHistories: {
          orderBy: {
            created_at: 'desc',
          },
          take: 10,
        },
        wallettransactions: {
          orderBy: {
            created_at: 'desc',
          },
          take: 10,
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
        },
        aiFollowers: {
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
        },
        order_requests: {
          orderBy: {
            created_at: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!aiAstrologer) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI Astrologer not found',
        },
        { status: 404 }
      );
    }

    // Calculate wallet balance
    const walletBalance = aiAstrologer.wallettransactions.reduce(
      (sum: number, transaction: any) => {
        return transaction.isCredit
          ? sum + (transaction.amount || 0)
          : sum - (transaction.amount || 0);
      },
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        ...aiAstrologer,
        walletBalance: walletBalance.toFixed(2),
        totalChats: aiAstrologer.aiChatHistories.length,
        totalOrders: aiAstrologer.order_requests.length,
        followerCount: aiAstrologer.aiFollowers.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching AI astrologer details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch AI astrologer details',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH - Update AI Astrologer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const aiAstrologerId = BigInt(params.id);
    const body = await request.json();

    const updatedAiAstrologer = await prisma.aiastrologers.update({
      where: { id: aiAstrologerId },
      data: {
        ...body,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AI Astrologer updated successfully',
      data: updatedAiAstrologer,
    });
  } catch (error: any) {
    console.error('Error updating AI astrologer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update AI astrologer',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete AI Astrologer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const aiAstrologerId = BigInt(params.id);

    await prisma.aiastrologers.delete({
      where: { id: aiAstrologerId },
    });

    return NextResponse.json({
      success: true,
      message: 'AI Astrologer deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting AI astrologer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete AI astrologer',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}