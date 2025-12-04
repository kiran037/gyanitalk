// app/api/blogs/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all blog categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const where: any = {
      isDelete: false,
    };
    
    if (!includeInactive) {
      where.isActive = true;
    }
    
    const categories = await prisma.blog_categories.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
    
    // Serialize BigInt
    const serializedCategories = categories.map(cat => ({
      ...cat,
      id: cat.id.toString(),
    }));
    
    return NextResponse.json({
      success: true,
      data: serializedCategories,
    });
  } catch (error: any) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create new blog category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, createdBy = 1 } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    const newCategory = await prisma.blog_categories.create({
      data: {
        name,
        isActive: true,
        isDelete: false,
        createdBy,
        modifiedBy: createdBy,
      },
    });
    
    // Serialize BigInt
    const serializedCategory = {
      ...newCategory,
      id: newCategory.id.toString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: serializedCategory,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update blog category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, isActive, modifiedBy = 1 } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const categoryId = BigInt(id);
    
    // Check if category exists
    const existingCategory = await prisma.blog_categories.findUnique({
      where: { id: categoryId, isDelete: false },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    const updatedCategory = await prisma.blog_categories.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive }),
        modifiedBy,
      },
    });
    
    // Serialize BigInt
    const serializedCategory = {
      ...updatedCategory,
      id: updatedCategory.id.toString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: serializedCategory,
    });
  } catch (error: any) {
    console.error('Error updating blog category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete blog category
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const categoryId = BigInt(id);
    
    // Check if category exists
    const existingCategory = await prisma.blog_categories.findUnique({
      where: { id: categoryId, isDelete: false },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category is being used
    const blogsUsingCategory = await prisma.blogs.count({
      where: {
        blogCategoryId: categoryId,
        isDelete: false,
      },
    });
    
    if (blogsUsingCategory > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category. ${blogsUsingCategory} blog(s) are using this category.` 
        },
        { status: 400 }
      );
    }
    
    // Soft delete
    await prisma.blog_categories.update({
      where: { id: categoryId },
      data: {
        isDelete: true,
        isActive: false,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting blog category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}