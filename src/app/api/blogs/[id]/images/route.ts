// // app/api/blogs/[id]/images/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params;
//     const blogId = BigInt(id);

    
//     // Check if blog exists
//     const blog = await prisma.blogs.findUnique({
//       where: { id: blogId, isDelete: false },
//     });
    
//     if (!blog) {
//       return NextResponse.json(
//         { success: false, error: 'Blog not found' },
//         { status: 404 }
//       );
//     }
    
//     // Fetch images
//     const images = await prisma.blog_images.findMany({
//       where: {
//         blogId,
//         isDelete: false,
//       },
//       orderBy: {
//         created_at: 'desc',
//       },
//     });

//     // Serialize BigInt
// const serializedImages = images.map((img: any) => ({
//   ...img,
//   id: img.id.toString(),
//   blogId: img.blogId.toString(),
// }));

    
//     return NextResponse.json({
//       success: true,
//       data: serializedImages,
//     });
//   } catch (error: any) {
//     console.error('Error fetching blog images:', error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params;
//     const blogId = BigInt(id);
//     const body = await request.json();

    
//     const { imagePath, createdBy = 1 } = body;
    
//     // Validate
//     if (!imagePath) {
//       return NextResponse.json(
//         { success: false, error: 'Image path is required' },
//         { status: 400 }
//       );
//     }
    
//     // Check if blog exists
//     const blog = await prisma.blogs.findUnique({
//       where: { id: blogId, isDelete: false },
//     });
    
//     if (!blog) {
//       return NextResponse.json(
//         { success: false, error: 'Blog not found' },
//         { status: 404 }
//       );
//     }
    
//     // Create image
//     const newImage = await prisma.blog_images.create({
//       data: {
//         blogId,
//         imagePath,
//         isActive: true,
//         isDelete: false,
//         createdBy,
//         modifiedBy: createdBy,
//       },
//     });
    
//     // Serialize BigInt
//     const serializedImage = {
//       ...newImage,
//       id: newImage.id.toString(),
//       blogId: newImage.blogId.toString(),
//     };
    
//     return NextResponse.json({
//       success: true,
//       message: 'Image added successfully',
//       data: serializedImage,
//     }, { status: 201 });
//   } catch (error: any) {
//     console.error('Error adding blog image:', error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params;
//     const blogId = BigInt(id);
//     const searchParams = request.nextUrl.searchParams;
//     const imageId = searchParams.get('imageId');

    
//     if (!imageId) {
//       return NextResponse.json(
//         { success: false, error: 'Image ID is required' },
//         { status: 400 }
//       );
//     }
    
//     // Check if image exists and belongs to this blog
//     const image = await prisma.blog_images.findFirst({
//       where: {
//         id: BigInt(imageId),
//         blogId,
//         isDelete: false,
//       },
//     });
    
//     if (!image) {
//       return NextResponse.json(
//         { success: false, error: 'Image not found' },
//         { status: 404 }
//       );
//     }
    
//     // Soft delete
//     await prisma.blog_images.update({
//       where: { id: BigInt(imageId) },
//       data: {
//         isDelete: true,
//         isActive: false,
//       },
//     });
    
//     return NextResponse.json({
//       success: true,
//       message: 'Image deleted successfully',
//     });
//   } catch (error: any) {
//     console.error('Error deleting blog image:', error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

// app/api/blogs/[id]/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

function notFound(message = "Not found") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!/^\d+$/.test(id)) {
      return badRequest("Invalid blog id");
    }

    const blogId = BigInt(id);

    // Check if blog exists (use findFirst when filtering on non-unique fields)
    const blog = await prisma.blogs.findFirst({
      where: { id: blogId, isDelete: false },
    });

    if (!blog) {
      return notFound("Blog not found");
    }

    // Fetch images
    const images = await prisma.blog_images.findMany({
      where: {
        blogId,
        isDelete: false,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Serialize BigInt fields to strings for JSON
    const serializedImages = images.map((img: any) => ({
      ...img,
      id: img.id.toString(),
      blogId: img.blogId.toString(),
      // if you have other BigInt fields, serialize them here as needed
    }));

    return NextResponse.json({ success: true, data: serializedImages });
  } catch (error: any) {
    console.error("Error fetching blog images:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!/^\d+$/.test(id)) {
      return badRequest("Invalid blog id");
    }

    const blogId = BigInt(id);
    const body = await request.json().catch(() => null);

    if (!body) return badRequest("Invalid JSON body");

    const { imagePath, createdBy = 1 } = body;

    if (!imagePath || typeof imagePath !== "string" || !imagePath.trim()) {
      return badRequest("Image path is required");
    }

    // Check if blog exists
    const blog = await prisma.blogs.findFirst({
      where: { id: blogId, isDelete: false },
    });

    if (!blog) {
      return notFound("Blog not found");
    }

    // Create image record
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

    const serializedImage = {
      ...newImage,
      id: newImage.id.toString(),
      blogId: newImage.blogId.toString(),
    };

    return NextResponse.json(
      { success: true, message: "Image added successfully", data: serializedImage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding blog image:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!/^\d+$/.test(id)) {
      return badRequest("Invalid blog id");
    }

    const blogId = BigInt(id);
    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get("imageId");

    if (!imageId || !/^\d+$/.test(imageId)) {
      return badRequest("Image ID is required and must be numeric");
    }

    const imageBigId = BigInt(imageId);

    // Check if image exists and belongs to this blog
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

    // Soft delete
    await prisma.blog_images.update({
      where: { id: imageBigId },
      data: {
        isDelete: true,
        isActive: false,
      },
    });

    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting blog image:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}