import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

function notFound(message = "Not found") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

/* ---------------- GET ---------------- */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!/^\d+$/.test(id)) {
      return badRequest("Invalid blog id");
    }

    const blogId = BigInt(id);

    const blog = await prisma.blogs.findFirst({
      where: { id: blogId, isDelete: false },
    });

    if (!blog) {
      return notFound("Blog not found");
    }

    const images = await prisma.blog_images.findMany({
      where: {
        blogId,
        isDelete: false,
      },
      orderBy: { created_at: "desc" },
    });

    const serializedImages = images.map((img) => ({
      ...img,
      id: img.id.toString(),
      blogId: img.blogId.toString(),
    }));

    return NextResponse.json({ success: true, data: serializedImages });
  } catch (error: any) {
    console.error("GET blog images error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ---------------- POST ---------------- */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!/^\d+$/.test(id)) {
      return badRequest("Invalid blog id");
    }

    const blogId = BigInt(id);
    const body = await request.json();

    const { imagePath, createdBy = 1 } = body ?? {};

    if (!imagePath || typeof imagePath !== "string") {
      return badRequest("Image path is required");
    }

    const blog = await prisma.blogs.findFirst({
      where: { id: blogId, isDelete: false },
    });

    if (!blog) {
      return notFound("Blog not found");
    }

    const newImage = await prisma.blog_images.create({
      data: {
        blogId,
        imagePath: imagePath.trim(),
        isActive: true,
        isDelete: false,
        createdBy,
        modifiedBy: createdBy,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newImage,
          id: newImage.id.toString(),
          blogId: newImage.blogId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST blog image error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!/^\d+$/.test(id)) {
      return badRequest("Invalid blog id");
    }

    const blogId = BigInt(id);
    const imageId = request.nextUrl.searchParams.get("imageId");

    if (!imageId || !/^\d+$/.test(imageId)) {
      return badRequest("Valid imageId is required");
    }

    const imageBigId = BigInt(imageId);

    const image = await prisma.blog_images.findFirst({
      where: {
        id: imageBigId,
        blogId,
        isDelete: false,
      },
    });

    if (!image) {
      return notFound("Image not found");
    }

    await prisma.blog_images.update({
      where: { id: imageBigId },
      data: {
        isDelete: true,
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE blog image error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}