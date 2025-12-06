// app/api/ai-astrologers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - List all AI Astrologers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const aiType = searchParams.get('aiType');
    const featured = searchParams.get('featured');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (aiType) {
      where.aiType = aiType;
    }

    if (featured !== null && featured !== undefined) {
      where.featured = parseInt(featured);
    }

    const [aiAstrologers, total] = await Promise.all([
      prisma.aiastrologers.findMany({
        where,
        skip,
        take: limit,
        include: {
          aiChatHistories: {
            select: { id: true },
          },
          wallettransactions: {
            select: {
              amount: true,
              isCredit: true,
            },
          },
          aiFollowers: {
            select: { id: true },
          },
          order_requests: {
            select: { id: true },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.aiastrologers.count({ where }),
    ]);

    // Calculate stats for each AI astrologer
    const aiAstrologersWithStats = aiAstrologers.map((ai) => {
      const walletBalance = ai.wallettransactions.reduce(
        (sum: number, transaction: any) => {
          return transaction.isCredit
            ? sum + (transaction.amount || 0)
            : sum - (transaction.amount || 0);
        },
        0
      );

      return {
        ...ai,
        totalChats: ai.aiChatHistories.length,
        totalOrders: ai.order_requests.length,
        followerCount: ai.aiFollowers.length,
        walletBalance: walletBalance.toFixed(2),
        aiChatHistories: undefined,
        wallettransactions: undefined,
        aiFollowers: undefined,
        order_requests: undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: aiAstrologersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching AI astrologers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch AI astrologers',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new AI Astrologer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      image,
      about,
      astrologerCategoryId,
      primary_skill,
      all_skills,
      chat_charge,
      chat_charge_usd,
      experience,
      system_intruction,
      slug,
      type,
      aiType,
      referral_code,
      featured,
    } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required',
        },
        { status: 400 }
      );
    }

    const newAiAstrologer = await prisma.aiastrologers.create({
      data: {
        name,
        image,
        about,
        astrologerCategoryId,
        primary_skill,
        all_skills,
        chat_charge,
        chat_charge_usd,
        experience,
        system_intruction,
        slug,
        type,
        aiType,
        referral_code,
        featured: featured || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AI Astrologer created successfully',
      data: newAiAstrologer,
    });
  } catch (error: any) {
    console.error('Error creating AI astrologer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create AI astrologer',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}