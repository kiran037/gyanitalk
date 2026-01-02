import { NextResponse } from "next/server";
import {prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const blogs = await prisma.blogs.findMany({
      where: {
        isActive: true,
        isDelete: false,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        blogImage: true, // or previewImage depending on your logic
        previewImage: true,
        description: true,
        author: true,
        postedOn: true,
        // We fetch the category name if possible, assuming manual join or just raw data
        // since relation wasn't explicitly clear in the provided schema snippet for 'include'
        blogCategoryId: true 
      },
      orderBy: {
        postedOn: 'desc',
      },
      take: 8, // Fetch latest 8 blogs
    });

    // Convert BigInt to String for JSON serialization
    const formattedBlogs = blogs.map((blog) => ({
      ...blog,
      id: blog.id.toString(),
      blogCategoryId: blog.blogCategoryId?.toString() || null,
    }));

    return NextResponse.json({ success: true, data: formattedBlogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}