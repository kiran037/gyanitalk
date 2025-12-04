// app/api/blogs/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Bulk operations on blogs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, blogIds, modifiedBy = 1 } = body;
    
    // Validate
    if (!operation || !blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Operation and blogIds are required' },
        { status: 400 }
      );
    }
    
    // Convert string IDs to BigInt
    const ids = blogIds.map((id: string) => BigInt(id));
    
    let result;
    
    switch (operation) {
      case 'delete':
        // Bulk soft delete
        result = await prisma.blogs.updateMany({
          where: {
            id: { in: ids },
            isDelete: false,
          },
          data: {
            isDelete: true,
            isActive: false,
            modifiedBy,
          },
        });
        
        return NextResponse.json({
          success: true,
          message: `${result.count} blog(s) deleted successfully`,
          count: result.count,
        });
        
      case 'activate':
        // Bulk activate
        result = await prisma.blogs.updateMany({
          where: {
            id: { in: ids },
            isDelete: false,
          },
          data: {
            isActive: true,
            modifiedBy,
          },
        });
        
        return NextResponse.json({
          success: true,
          message: `${result.count} blog(s) activated successfully`,
          count: result.count,
        });
        
      case 'deactivate':
        // Bulk deactivate
        result = await prisma.blogs.updateMany({
          where: {
            id: { in: ids },
            isDelete: false,
          },
          data: {
            isActive: false,
            modifiedBy,
          },
        });
        
        return NextResponse.json({
          success: true,
          message: `${result.count} blog(s) deactivated successfully`,
          count: result.count,
        });
        
      case 'changeCategory':
        // Bulk change category
        const { categoryId } = body;
        
        if (!categoryId) {
          return NextResponse.json(
            { success: false, error: 'Category ID is required for this operation' },
            { status: 400 }
          );
        }
        
        // Verify category exists
        const category = await prisma.blog_categories.findUnique({
          where: { id: BigInt(categoryId), isDelete: false },
        });
        
        if (!category) {
          return NextResponse.json(
            { success: false, error: 'Category not found' },
            { status: 404 }
          );
        }
        
        result = await prisma.blogs.updateMany({
          where: {
            id: { in: ids },
            isDelete: false,
          },
          data: {
            blogCategoryId: BigInt(categoryId),
            modifiedBy,
          },
        });
        
        return NextResponse.json({
          success: true,
          message: `${result.count} blog(s) category updated successfully`,
          count: result.count,
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET: Export blogs to CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');
    
    const where: any = {
      isDelete: false,
    };
    
    if (categoryId) {
      where.blogCategoryId = BigInt(categoryId);
    }
    
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }
    
    const blogs = await prisma.blogs.findMany({
      where,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        blogCategoryId: true,
        viewer: true,
        postedOn: true,
        isActive: true,
        created_at: true,
      },
    });
    
    // Convert to CSV format
    const headers = ['ID', 'Title', 'Slug', 'Author', 'Category ID', 'Views', 'Posted Date', 'Active', 'Created Date'];
    const csvRows = [headers.join(',')];
    
    blogs.forEach(blog => {
      const row = [
        blog.id.toString(),
        `"${blog.title.replace(/"/g, '""')}"`, // Escape quotes
        blog.slug || '',
        blog.author,
        blog.blogCategoryId?.toString() || '',
        blog.viewer?.toString() || '0',
        blog.postedOn ? new Date(blog.postedOn).toISOString() : '',
        blog.isActive ? 'Yes' : 'No',
        blog.created_at ? new Date(blog.created_at).toISOString() : '',
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="blogs-export-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting blogs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}