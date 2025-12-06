// app/api/astrologer-groups/search-astrologers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Search query
    const search = searchParams.get('search') || '';
    const groupId = searchParams.get('groupId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!search) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Please provide a search query',
      });
    }

    // Build where clause for search
    const where: any = {
      isDelete: false,
      isActive: true,
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactNo: { contains: search } },
      ],
    };

    // Get astrologers
    let astrologers = await prisma.astrologers.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        profileImage: true,
        primarySkill: true,
        allSkill: true,
        experienceInYears: true,
        charge: true,
        isVerified: true,
      },
      take: limit,
    });

    // If groupId is provided, filter out astrologers already in that group
    if (groupId) {
      const groupIdBigInt = BigInt(groupId);
      
      const astrologersInGroup = await prisma.astrologer_assign_group.findMany({
        where: { group_id: groupIdBigInt },
        select: { astrologerId: true },
      });

      const astrologersInGroupIds = astrologersInGroup
        .map(a => a.astrologerId?.toString())
        .filter(Boolean) as string[];
      
      astrologers = astrologers.filter(
        (a) => !astrologersInGroupIds.includes(a.id.toString())
      );
    }

    return NextResponse.json({
      success: true,
      data: astrologers,
    });
  } catch (error: any) {
    console.error('Error searching astrologers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search astrologers',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}