import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function PATCH(
  request: NextRequest,

  { params }: { params: any }
) {
  try {

    const resolvedParams = await params;
    const idStr = resolvedParams?.id;

    if (!idStr) {
      return NextResponse.json(
        { success: false, error: "Missing blog id" },
        { status: 400 }
      );
    }


    let blogId: bigint;
    try {
      blogId = BigInt(idStr);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid blog id" },
        { status: 400 }
      );
    }


    const blog = await prisma.blogs.findUnique({
      where: { id: blogId, isDelete: false },
      select: { isActive: true },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Toggle status
    const updatedBlog = await prisma.blogs.update({
      where: { id: blogId },
      data: {
        isActive: !blog.isActive,
      },
      select: {
        id: true,
        title: true,
        isActive: true,
      },
    });

    // Serialize BigInt id to string for JSON
    const serializedBlog = {
      ...updatedBlog,
      id: updatedBlog.id.toString?.() ?? String(updatedBlog.id),
    };

    return NextResponse.json({
      success: true,
      message: `Blog ${serializedBlog.isActive ? "activated" : "deactivated"} successfully`,
      data: serializedBlog,
    });
  } catch (error: any) {
    console.error("Error toggling blog status:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
