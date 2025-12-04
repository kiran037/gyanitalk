// app/api/blogs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch single blog by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const blogId = BigInt(id);

    
    const blog = await prisma.blogs.findUnique({
      where: {
        id: blogId,
        isDelete: false,
      },
    });
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Serialize BigInt
    const serializedBlog = {
      ...blog,
      id: blog.id.toString(),
      blogCategoryId: blog.blogCategoryId?.toString() || null,
      viewer: blog.viewer?.toString() || '0',
    };
    
    return NextResponse.json({
      success: true,
      data: serializedBlog,
    });
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update blog by ID
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const blogId = BigInt(id);
    const body = await request.json();

    
    const {
      title,
      slug,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      schemaJson,
      blogImage,
      blogCategoryId,
      description,
      author,
      postedOn,
      extension,
      previewImage,
      isActive,
      modifiedBy = 1, // Default admin user ID
    } = body;
    
    // Check if blog exists
    const existingBlog = await prisma.blogs.findUnique({
      where: { id: blogId, isDelete: false },
    });
    
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Update blog
    const updatedBlog = await prisma.blogs.update({
      where: { id: blogId },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(metaKeywords !== undefined && { metaKeywords }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(ogTitle !== undefined && { ogTitle }),
        ...(ogDescription !== undefined && { ogDescription }),
        ...(ogImage !== undefined && { ogImage }),
        ...(twitterTitle !== undefined && { twitterTitle }),
        ...(twitterDescription !== undefined && { twitterDescription }),
        ...(twitterImage !== undefined && { twitterImage }),
        ...(schemaJson !== undefined && { schemaJson }),
        ...(blogImage && { blogImage }),
        ...(blogCategoryId !== undefined && { 
          blogCategoryId: blogCategoryId ? BigInt(blogCategoryId) : null 
        }),
        ...(description && { description }),
        ...(author && { author }),
        ...(postedOn && { postedOn: new Date(postedOn) }),
        ...(extension !== undefined && { extension }),
        ...(previewImage !== undefined && { previewImage }),
        ...(isActive !== undefined && { isActive }),
        modifiedBy,
      },
    });
    
    // Serialize BigInt
    const serializedBlog = {
      ...updatedBlog,
      id: updatedBlog.id.toString(),
      blogCategoryId: updatedBlog.blogCategoryId?.toString() || null,
      viewer: updatedBlog.viewer?.toString() || '0',
    };
    
    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
      data: serializedBlog,
    });
  } catch (error: any) {
    console.error('Error updating blog:', error);
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

    
    // Check if blog exists
    const existingBlog = await prisma.blogs.findUnique({
      where: { id: blogId, isDelete: false },
    });
    
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Soft delete
    await prisma.blogs.update({
      where: { id: blogId },
      data: {
        isDelete: true,
        isActive: false,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}