// app/api/blogs/[id]/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const blogId = BigInt(id);

    
    // Check if blog exists
    const blog = await prisma.blogs.findUnique({
      where: { id: blogId, isDelete: false },
    });
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Fetch images
    const images = await prisma.blog_images.findMany({
      where: {
        blogId,
        isDelete: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Serialize BigInt
const serializedImages = images.map((img: any) => ({
  ...img,
  id: img.id.toString(),
  blogId: img.blogId.toString(),
}));

    
    return NextResponse.json({
      success: true,
      data: serializedImages,
    });
  } catch (error: any) {
    console.error('Error fetching blog images:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const blogId = BigInt(id);
    const body = await request.json();

    
    const { imagePath, createdBy = 1 } = body;
    
    // Validate
    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: 'Image path is required' },
        { status: 400 }
      );
    }
    
    // Check if blog exists
    const blog = await prisma.blogs.findUnique({
      where: { id: blogId, isDelete: false },
    });
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Create image
    const newImage = await prisma.blog_images.create({
      data: {
        blogId,
        imagePath,
        isActive: true,
        isDelete: false,
        createdBy,
        modifiedBy: createdBy,
      },
    });
    
    // Serialize BigInt
    const serializedImage = {
      ...newImage,
      id: newImage.id.toString(),
      blogId: newImage.blogId.toString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Image added successfully',
      data: serializedImage,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding blog image:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const blogId = BigInt(id);
    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get('imageId');

    
    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }
    
    // Check if image exists and belongs to this blog
    const image = await prisma.blog_images.findFirst({
      where: {
        id: BigInt(imageId),
        blogId,
        isDelete: false,
      },
    });
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Soft delete
    await prisma.blog_images.update({
      where: { id: BigInt(imageId) },
      data: {
        isDelete: true,
        isActive: false,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting blog image:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}