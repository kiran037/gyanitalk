// app/api/blogs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all blogs with filters, search, pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build where clause
    const where: any = {
      isDelete: false,
    };
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ];
    }
    
    if (categoryId) {
      where.blogCategoryId = BigInt(categoryId);
    }
    
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }
    
    // Fetch blogs with count
    const [blogs, totalCount] = await Promise.all([
      prisma.blogs.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          blogImage: true,
          previewImage: true,
          blogCategoryId: true,
          author: true,
          postedOn: true,
          viewer: true,
          isActive: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.blogs.count({ where }),
    ]);
    
    // Convert BigInt to string for JSON serialization
    const serializedBlogs = blogs.map(blog => ({
      ...blog,
      id: blog.id.toString(),
      blogCategoryId: blog.blogCategoryId?.toString() || null,
      viewer: blog.viewer?.toString() || '0',
    }));
    
    return NextResponse.json({
      success: true,
      data: serializedBlogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new blog
export async function POST(request: NextRequest) {
  try {
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
      createdBy = 1, // Default admin user ID
    } = body;
    
    // Validate required fields
    if (!title || !blogImage || !description || !author) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create blog
    const newBlog = await prisma.blogs.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
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
        blogCategoryId: blogCategoryId ? BigInt(blogCategoryId) : null,
        description,
        viewer: BigInt(0),
        author,
        postedOn: postedOn ? new Date(postedOn) : new Date(),
        extension,
        previewImage,
        isActive: true,
        isDelete: false,
        createdBy,
        modifiedBy: createdBy,
      },
    });
    
    // Serialize BigInt
    const serializedBlog = {
      ...newBlog,
      id: newBlog.id.toString(),
      blogCategoryId: newBlog.blogCategoryId?.toString() || null,
      viewer: newBlog.viewer?.toString() || '0',
    };
    
    return NextResponse.json({
      success: true,
      message: 'Blog created successfully',
      data: serializedBlog,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}