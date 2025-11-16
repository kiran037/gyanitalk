import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // ✅ Await params
        const blogId = BigInt(id);

        // Get blog details
        const blog = await prisma.blogs.findFirst({
            where: {
                id: blogId,
                isActive: true,
                isDelete: false,
            },
        });

        if (!blog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 }
            );
        }

        // Increment viewer count
        await prisma.blogs.update({
            where: { id: blogId },
            data: {
                viewer: {
                    increment: 1
                }
            }
        });

        // Get category name if exists
        let categoryName = null;
        if (blog.blogCategoryId) {
            const category = await prisma.blog_categories.findFirst({
                where: { id: blog.blogCategoryId }
            });
            categoryName = category?.name || null;
        }

        // Get related blogs (same category, exclude current)
        const relatedBlogs = await prisma.blogs.findMany({
            where: {
                blogCategoryId: blog.blogCategoryId,
                id: { not: blogId },
                isActive: true,
                isDelete: false,
            },
            take: 3,
            orderBy: {
                postedOn: 'desc'
            }
        });

        const serializedBlog = {
            ...blog,
            id: blog.id.toString(),
            blogCategoryId: blog.blogCategoryId?.toString() || null,
            viewer: (blog.viewer ? blog.viewer + BigInt(1) : BigInt(1)).toString(),
            categoryName,
            blogImage: blog.blogImage.startsWith('http') ? blog.blogImage : `${process.env.NEXT_PUBLIC_BASEURL || ''}${blog.blogImage}`
        };

        const serializedRelatedBlogs = relatedBlogs.map((b: any) => ({
            ...b,
            id: b.id.toString(),
            blogCategoryId: b.blogCategoryId?.toString() || null,
            viewer: b.viewer?.toString() || "0",
            blogImage: b.blogImage.startsWith('http') ? b.blogImage : `${process.env.NEXT_PUBLIC_BASEURL || ''}${b.blogImage}`,
        }));

        return NextResponse.json({
            success: true,
            data: serializedBlog,
            relatedBlogs: serializedRelatedBlogs,
        });

    } catch (error) {
        console.error("Blog detail error:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog details" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // ✅ Await params
        const blogId = BigInt(id);

        // Just increment view count (alternative endpoint)
        await prisma.blogs.update({
            where: { id: blogId },
            data: {
                viewer: {
                    increment: 1
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "View count updated"
        });

    } catch (error) {
        console.error("View count error:", error);
        return NextResponse.json(
            { error: "Failed to update view count" },
            { status: 500 }
        );
    }
}