// app/api/profile/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { uploadImage } from "@/upload";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

// Helper: Get user from JWT token
async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      token = request.cookies.get("token")?.value;
    }

    if (!token) {
      return null;
    }

    const session = await verifyUserJWT(token);
    return session;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserFromRequest(request);
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(session.userId);
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Upload image using your upload helper
    const uploadResult = await uploadImage(file, "profiles", "public/storage");

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Update user profile with new image path
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        profile: uploadResult.mainPath,
        updated_at: new Date(),
      },
      select: {
        id: true,
        profile: true,
      },
    });

    const safeData = convertPrismaTypes(updatedUser);

    return NextResponse.json({
      success: true,
      data: {
        ...safeData,
        imageUrl: uploadResult.url || uploadResult.path,
      },
      message: "Profile image updated successfully",
    });
  } catch (error: any) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image",
        message: error.message,
      },
      { status: 500 }
    );
  }
}