// app/api/profile/upload-image/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { uploadImage } from "@/upload"; // Assuming you have this helper

async function getSession(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return await verifyUserJWT(token);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    // 1. Upload to storage
    const uploadResult = await uploadImage(file, "profiles", "public/storage");
    
    if (!uploadResult.success) {
      return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }

    // 2. Update DB
    await prisma.users.update({
      where: { id: BigInt(session.userId) },
      data: {
        profile: uploadResult.mainPath, // e.g., "storage/profiles/image.jpg"
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Avatar updated",
      data: { imageUrl: uploadResult.url || uploadResult.mainPath },
    });

  } catch (error: any) {
    console.error("Image Upload Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}