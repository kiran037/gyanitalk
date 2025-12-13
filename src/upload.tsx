// /src/upload.tsx
"use server";

import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Determine if S3 is configured
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
  mainPath: string; // canonical key inside bucket (or filesystem path)
  path: string; // what existing code expects (relative key)
  url?: string; // full public URL to access the file (optional)
};

function trimSlashes(value?: string) {
  return (value || "").replace(/^\/+|\/+$/g, "");
}

/**
 * Uploads a file either to S3 (if configured) or to local filesystem (dev fallback).
 *
 * @param file - File object from browser
 * @param uploadPath - logical folder like "blogs" (can include nested folders)
 * @param newPath - optional additional prefix (e.g. tenant or other folder)
 */
export async function uploadImage(
  file: File,
  uploadPath: string,
  newPath?: string
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const timestamp = Date.now();
  const ext = path.extname(file.name || ".png") || ".png";
  const uniqueName = `${timestamp}-${Math.random().toString(36).slice(2)}${ext}`;

  // Use S3 if configured
  if (s3Client && hasS3Config) {
    const bucket = process.env.AWS_BUCKET_NAME!;
    const region = process.env.AWS_REGION!;

    const prefixFromEnv = trimSlashes(process.env.UPLOAD_PATH) || "public/storage";
    const cleanedParts: string[] = [];

    // ensure prefix (from env or default) is first
    if (prefixFromEnv) cleanedParts.push(prefixFromEnv);

    // optional newPath
    if (newPath && newPath.trim() !== "") {
      cleanedParts.push(trimSlashes(newPath));
    }

    // uploadPath provided by caller (e.g. "blogs")
    if (uploadPath && uploadPath.trim() !== "") {
      cleanedParts.push(trimSlashes(uploadPath));
    }

    // Use POSIX join to ensure forward slashes for S3 keys
    const prefix = cleanedParts.join("/");
    const key = prefix ? `${prefix}/${uniqueName}` : uniqueName;

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    );


    const baseUrl =
      process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
      process.env.ASSET_BASE_URL ||
      `https://${bucket}.s3.${region}.amazonaws.com`;

    const publicUrl = `${baseUrl.replace(/\/+$/g, "")}/${key}`;

    return {
      success: true,
      mainPath: key, // canonical key in bucket
      path: key, // existing code expects relative key (so keeping same)
      url: publicUrl,
    };
  }

  const uploadPathFromEnv = trimSlashes(process.env.UPLOAD_PATH || "public/storage");


  const baseDir = newPath && newPath.trim() !== "" ? trimSlashes(newPath) : uploadPathFromEnv;


  const uploadsDir = path.join(process.cwd(), baseDir, trimSlashes(uploadPath));

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const finalPathOnDisk = path.join(uploadsDir, uniqueName);
  await fs.promises.writeFile(finalPathOnDisk, buffer);


  const relativeKey = `${baseDir}/${trimSlashes(uploadPath)}/${uniqueName}`;

  return {
    success: true,
    mainPath: relativeKey,
    path: relativeKey,
  };
}