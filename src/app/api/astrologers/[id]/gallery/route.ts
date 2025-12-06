// app/api/astrologers/[id]/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {
      astrologerId: astrologerId,
      status: 1, // Active status
    };

    const [gallery, total] = await Promise.all([
      prisma.astrologers_gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.astrologers_gallery.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: gallery,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gallery',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const astrologerId = parseInt(params.id);
    const body = await request.json();
    
    const { image, userId, createdBy, modifiedBy } = body;

    if (!image || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image and userId are required',
        },
        { status: 400 }
      );
    }

    const newGalleryItem = await prisma.astrologers_gallery.create({
      data: {
        astrologerId,
        userId,
        image,
        status: 1,
        createdBy: createdBy || userId,
        modifiedBy: modifiedBy || userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item added successfully',
      data: newGalleryItem,
    });
  } catch (error: any) {
    console.error('Error adding gallery item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add gallery item',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// app/api/astrologers/[id]/gallery/[galleryId]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; galleryId: string } }
) {
  try {
    const galleryId = parseInt(params.galleryId);

    const deletedItem = await prisma.astrologers_gallery.update({
      where: { id: galleryId },
      data: { status: 0 }, // Soft delete by setting status to 0
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully',
      data: deletedItem,
    });
  } catch (error: any) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete gallery item',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}