// /src/upload.tsx
"use server";

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/* ------------------------------------------------------------------ */
/* Utils */
/* ------------------------------------------------------------------ */

function trimSlashes(value?: string) {
  return (value || "").replace(/^\/+|\/+$/g, "");
}

/* ------------------------------------------------------------------ */
/* Environment & Clients */
/* ------------------------------------------------------------------ */

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

// 🔒 lock filesystem root (fixes Turbopack + security)
const FS_ROOT = path.join(
  process.cwd(),
  trimSlashes(process.env.UPLOAD_FS_ROOT || "public/storage")
);

// S3 prefix (string only, no filesystem meaning)
const S3_PREFIX = trimSlashes(
  process.env.UPLOAD_S3_PREFIX || "public/storage"
);

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

export type UploadResult = {
  success: boolean;
  mainPath: string;
  path: string;
  url?: string;
};

/* ------------------------------------------------------------------ */
/* Upload */
/* ------------------------------------------------------------------ */

export async function uploadImage(
  file: File,
  uploadPath: string,
  newPath?: string
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const ext = path.extname(file.name || ".png") || ".png";
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  /* ========================= S3 ========================= */

  if (s3Client && hasS3Config) {
    const bucket = process.env.AWS_BUCKET_NAME!;
    const region = process.env.AWS_REGION!;

    const keyParts = [
      S3_PREFIX,
      trimSlashes(newPath),
      trimSlashes(uploadPath),
      uniqueName,
    ].filter(Boolean);

    const key = keyParts.join("/");

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        ContentDisposition: "inline",
      })
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
      process.env.ASSET_BASE_URL ||
      `https://${bucket}.s3.${region}.amazonaws.com`;

    return {
      success: true,
      mainPath: key,
      path: key,
      url: `${baseUrl.replace(/\/+$/, "")}/${key}`,
    };
  }

  /* ========================= LOCAL FS ========================= */

  const uploadsDir = path.join(
    FS_ROOT,
    trimSlashes(newPath),
    trimSlashes(uploadPath)
  );

  // 🔐 prevent directory traversal
  const resolved = path.resolve(uploadsDir);
  if (!resolved.startsWith(FS_ROOT)) {
    throw new Error("Invalid upload path");
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const finalPath = path.join(uploadsDir, uniqueName);
  await fs.promises.writeFile(finalPath, buffer);

  const relativeKey = [
    trimSlashes(process.env.UPLOAD_FS_ROOT || "public/storage"),
    trimSlashes(newPath),
    trimSlashes(uploadPath),
    uniqueName,
  ]
    .filter(Boolean)
    .join("/");

  return {
    success: true,
    mainPath: relativeKey,
    path: relativeKey,
    url: `/${relativeKey}`,
  };
}