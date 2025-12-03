// app/api/settings/banners/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single banner
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await prisma.banners.findFirst({
      where: {
        id: BigInt(params.id),
        isDelete: false,
      },
      include: {
        bannerType: true,
      },
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    const bannerData = {
      ...banner,
      id: banner.id.toString(),
      bannerTypeId: banner.bannerTypeId.toString(),
      bannerType: banner.bannerType
        ? {
            ...banner.bannerType,
            id: banner.bannerType.id.toString(),
            appId: banner.bannerType.appId.toString(),
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: bannerData,
    });
  } catch (error: any) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

// PUT - Update banner
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { bannerImage, fromDate, toDate, bannerTypeId, isActive, modifiedBy } = body;

    // Check if exists
    const existing = await prisma.banners.findFirst({
      where: {
        id: BigInt(params.id),
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'ModifiedBy is required' },
        { status: 400 }
      );
    }

    // Validate dates if both provided
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from >= to) {
        return NextResponse.json(
          { success: false, error: 'FromDate must be before ToDate' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      modifiedBy: parseInt(modifiedBy),
      updated_at: new Date(),
    };

    if (bannerImage) updateData.bannerImage = bannerImage;
    if (fromDate) updateData.fromDate = new Date(fromDate);
    if (toDate) updateData.toDate = new Date(toDate);
    if (bannerTypeId) updateData.bannerTypeId = BigInt(bannerTypeId);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.banners.update({
      where: { id: BigInt(params.id) },
      data: updateData,
      include: {
        bannerType: true,
      },
    });

    const updatedData = {
      ...updated,
      id: updated.id.toString(),
      bannerTypeId: updated.bannerTypeId.toString(),
      bannerType: updated.bannerType
        ? {
            ...updated.bannerType,
            id: updated.bannerType.id.toString(),
            appId: updated.bannerType.appId.toString(),
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully',
      data: updatedData,
    });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete banner
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const modifiedBy = searchParams.get('modifiedBy');

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: 'ModifiedBy is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.banners.findFirst({
      where: {
        id: BigInt(params.id),
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    await prisma.banners.update({
      where: { id: BigInt(params.id) },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy: parseInt(modifiedBy),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}