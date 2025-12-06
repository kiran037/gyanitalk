// app/api/astrologers/[id]/complete-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = BigInt(params.id);

    // Get complete astrologer details
    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId, isDelete: false },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            birthDate: true,
            birthTime: true,
            birthPlace: true,
            location: true,
            addressLine1: true,
            addressLine2: true,
            pincode: true,
            gender: true,
            profile: true,
            countryCode: true,
            created_at: true,
            updated_at: true,
          },
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

    // Get availability details
    const availability = await prisma.astrologer_availabilities.findMany({
      where: {
        astrologerId: astrologerId,
        isDelete: false,
      },
      orderBy: {
        day: 'asc',
      },
    });

    // Get skills/expertise details
    const expertise = await prisma.astrologer_expertises.findMany({
      where: {
        astrologerId: astrologerId,
        isDelete: false,
      },
    });

    // Get assigned groups
    const groups = await prisma.astrologer_assign_group.findMany({
      where: {
        astrologerId: astrologerId,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            created_at: true,
          },
        },
      },
    });

    // Get commission details
    const commissions = await prisma.commissions.findMany({
      where: {
        astrologerId: astrologerId,
        isDelete: false,
      },
      include: {
        commissionType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get withdraw requests
    const withdrawRequests = await prisma.withdrawrequest.findMany({
      where: {
        astrologerId: astrologerId,
        isDelete: 0,
      },
      include: {
        withdrawmethod: {
          select: {
            id: true,
            method_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        basicInfo: astrologer,
        availability: availability,
        expertise: expertise,
        groups: groups,
        commissions: commissions,
        withdrawRequests: withdrawRequests,
      },
    });
  } catch (error: any) {
    console.error('Error fetching complete details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch complete details',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}