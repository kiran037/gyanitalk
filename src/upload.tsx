// /src/upload.tsx
"use server";

import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Reuse one S3 client
const hasS3Config =
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY &&
  !!process.env.AWS_BUCKET_NAME &&
  !!process.env.AWS_REGION;

const s3Client = hasS3Config
  ? new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

type UploadResult = {
  success: boolean;
  mainPath: string; // for DB/storage
  path: string;     // what your existing code already uses
  // we add url (non-breaking, just extra)
  url?: string;
};

export async function uploadImage(
  file: File,
  uploadPath: string,
  newPath?: string
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const timestamp = Date.now();
  const ext = path.extname(file.name || ".png") || ".png";
  const uniqueName = `${timestamp}-${Math.random()
    .toString(36)
    .slice(2)}${ext}`;

  // If S3 is configured, use S3
  if (s3Client && hasS3Config) {
    const bucket = process.env.AWS_BUCKET_NAME!;
    const region = process.env.AWS_REGION!;

    // Build "folder" path similarly to your old logic
    const cleanedParts: string[] = [];

    if (newPath && newPath.trim() !== "") {
      cleanedParts.push(newPath.trim().replace(/^\/+|\/+$/g, ""));
    }

    if (uploadPath && uploadPath.trim() !== "") {
      cleanedParts.push(uploadPath.trim().replace(/^\/+|\/+$/g, ""));
    }

    const prefix = cleanedParts.join("/");
    const key = prefix ? `${prefix}/${uniqueName}` : uniqueName;

await s3Client.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: file.type || "application/octet-stream",
    // ❌ no ACL here anymore
  })
);


    // Base URL (S3 default or custom CDN/domain)
    const baseUrl =
      process.env.ASSET_BASE_URL ||
      `https://${bucket}.s3.${region}.amazonaws.com`;

    const publicUrl = `${baseUrl}/${key}`;

    return {
      success: true,
      // mainPath = key inside bucket (good for DB)
      mainPath: key,
      // path = keep it "relative" so your existing helpers
      // (like bannerSrcOf) can prepend their own base URL logic
      path: key,
      url: publicUrl,
    };
  }

  // Fallback: old local filesystem behavior (for dev / no AWS config)
  const baseDir =
    newPath && newPath.trim() !== ""
      ? newPath
      : process.env.UPLOAD_PATH;

  if (!baseDir) {
    throw new Error("UPLOAD_PATH not defined in environment variables");
  }

  const uploadsDir = path.join(baseDir, uploadPath);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const finalPath = path.join(uploadsDir, uniqueName);

  await fs.promises.writeFile(finalPath, buffer);

  const relativePath = `public/storage/${uploadPath}/${uniqueName}`;

  return {
    success: true,
    mainPath: `${newPath}/${uploadPath}/${uniqueName}`,
    path: relativePath,
  };
}
