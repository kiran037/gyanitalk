import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Type helpers
type BlogType = Awaited<ReturnType<typeof prisma.blogs.findFirst>>;
type CategoryType = Awaited<ReturnType<typeof prisma.blog_categories.findFirst>>;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const categoryId = searchParams.get("categoryId");

        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause: any = {
            isActive: true,
            isDelete: false,
        };

        if (categoryId) {
            whereClause.blogCategoryId = BigInt(categoryId);
        }

        // Get blogs with pagination
        const [blogs, totalCount] = await Promise.all([
            prisma.blogs.findMany({
                where: whereClause,
                orderBy: {
                    postedOn: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.blogs.count({
                where: whereClause
            })
        ]);

        // Get all categories for filter
        const categories = await prisma.blog_categories.findMany({
            where: {
                isActive: true,
                isDelete: false
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedBlogs = blogs.map((blog: NonNullable<BlogType>) => ({
            ...blog,
            id: blog.id.toString(),
            blogCategoryId: blog.blogCategoryId?.toString() || null,
            viewer: blog.viewer?.toString() || "0",
            blogImage: blog.blogImage.startsWith('http') ? blog.blogImage : `${process.env.NEXT_PUBLIC_BASEURL || ''}${blog.blogImage}`,
        }));

        const serializedCategories = categories.map((cat: NonNullable<CategoryType>) => ({
            ...cat,
            id: cat.id.toString(),
        }));

        return NextResponse.json({
            success: true,
            data: serializedBlogs,
            categories: serializedCategories,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                limit
            }
        });

    } catch (error) {
        console.error("Blog list error:", error);
        return NextResponse.json(
            { error: "Failed to fetch blogs" },
            { status: 500 }
        );
    }
}