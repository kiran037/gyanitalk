// app/api/settings/banners/types/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all banner types
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const appId = searchParams.get('appId');

    const where: any = { isDelete: false };

    if (activeOnly) {
      where.isActive = true;
    }

    if (appId) {
      where.appId = BigInt(appId);
    }

    const bannerTypes = await prisma.banner_types.findMany({
      where,
      include: {
        _count: {
          select: {
            banners: {
              where: {
                isDelete: false,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Convert BigInt to string
    const typesData = bannerTypes.map((type) => ({
      ...type,
      id: type.id.toString(),
      appId: type.appId.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: typesData,
      total: typesData.length,
    });
  } catch (error: any) {
    console.error('Error fetching banner types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner types' },
      { status: 500 }
    );
  }
}