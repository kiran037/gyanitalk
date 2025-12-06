// app/api/astrologers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = BigInt(params.id);

    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId, isDelete: false },
      include: {
        users: {
          select: {
            name: true,
            email: true,
            contactNo: true,
            profile: true,
            birthDate: true,
            birthPlace: true,
            location: true,
            addressLine1: true,
            addressLine2: true,
            pincode: true,
            gender: true,
            created_at: true,
          },
        },
        followers: {
          where: { isDelete: false, isActive: true },
          select: {
            id: true,
            userId: true,
            created_at: true,
            user: {
              select: {
                name: true,
                profile: true,
                email: true,
              },
            },
          },
        },
        walletTransactions: {
          select: {
            id: true,
            amount: true,
            transactionType: true,
            isCredit: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!astrologer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Astrologer not found',
        },
        { status: 404 }
      );
    }

    // Calculate wallet balance
    const allTransactions = await prisma.wallettransaction.findMany({
      where: { astrologerId: astrologerId },
      select: {
        amount: true,
        isCredit: true,
      },
    });

    const walletBalance = allTransactions.reduce((sum: number, transaction: any) => {
      return transaction.isCredit
        ? sum + (transaction.amount || 0)
        : sum - (transaction.amount || 0);
    }, 0);

    // Get chat count
    const chatCount = await prisma.chatrequest.count({
      where: { astrologerId: astrologerId },
    });

    // Get call count
    const callCount = await prisma.callrequest.count({
      where: { astrologerId: astrologerId },
    });

    // Get average rating
    const reviews = await prisma.user_reviews.findMany({
      where: { astrologerId: astrologerId, isDelete: false },
      select: { rating: true },
    });

    const averageRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...astrologer,
        followerCount: astrologer.followers.length,
        walletBalance: walletBalance.toFixed(2),
        chatCount,
        callCount,
        averageRating: averageRating.toFixed(1),
        reviewCount: reviews.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching astrologer details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch astrologer details',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = BigInt(params.id);

    // Soft delete
    const deletedAstrologer = await prisma.astrologers.update({
      where: { id: astrologerId },
      data: {
        isDelete: true,
        isActive: false,
        deleted_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Astrologer deleted successfully',
      data: deletedAstrologer,
    });
  } catch (error: any) {
    console.error('Error deleting astrologer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete astrologer',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}