import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/* ------------------- S3 SETUP ------------------- */

const hasS3 =
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY &&
  !!process.env.AWS_BUCKET_NAME &&
  !!process.env.AWS_REGION;

const s3 = hasS3
  ? new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

/* ------------------- CONSTANTS ------------------- */

const FS_ROOT = path.resolve("public/storage");
const S3_PREFIX = (process.env.UPLOAD_S3_PREFIX || "public/storage")
  .replace(/^\/+|\/+$/g, "");

/* ------------------- ROUTE ------------------- */

export async function POST(req: Request) {
  const data = await req.formData();

  const file = data.get("file") as File;
  const uploadPath = (data.get("uploadPath") as string) || "";
  const newPath = (data.get("newPath") as string) || "";

  if (!file) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name || ".png");
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  /* ==================== S3 (LIVE) ==================== */

  if (s3 && hasS3) {
    const key = [
      S3_PREFIX,
      newPath,
      uploadPath,
      filename,
    ]
      .filter(Boolean)
      .join("/")
      .replace(/\/+/g, "/");

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        ContentDisposition: "inline",
      })
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

    return NextResponse.json({
      success: true,
      mainPath: key,
      path: key,
      url: `${baseUrl.replace(/\/+$/, "")}/${key}`,
    });
  }

  /* ==================== LOCAL FS (DEV) ==================== */

  const dir = path.join(
    FS_ROOT,
    newPath.replace(/^\/+|\/+$/g, ""),
    uploadPath.replace(/^\/+|\/+$/g, "")
  );

  const resolved = path.resolve(dir);
  if (!resolved.startsWith(FS_ROOT)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  fs.mkdirSync(dir, { recursive: true });

  const finalPath = path.join(dir, filename);
  await fs.promises.writeFile(finalPath, buffer);

  const relativeKey = [
    "public/storage",
    newPath,
    uploadPath,
    filename,
  ]
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/");

  return NextResponse.json({
    success: true,
    mainPath: relativeKey,
    path: relativeKey,
    url: `/${relativeKey}`,
  });
}