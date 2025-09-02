"use server";

import fs from "fs";
import path from "path";

export async function uploadImage(
  file: File,
  uploadPath: string,
  newPath?: string
) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const baseDir =
    newPath && newPath.trim() !== ""
      ? newPath
      : process.env.UPLOAD_PATH || path.join(process.cwd(), "public/uploads");

  if (!baseDir) {
    throw new Error("UPLOAD_PATH not defined in environment variables");
  }

  const timestamp = Date.now();
  const uploadsDir = path.join(baseDir, uploadPath);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(file.name || ".png");
  const uniqueName = `${timestamp}${ext}`;
  const finalPath = path.join(uploadsDir, uniqueName);

  await fs.promises.writeFile(finalPath, buffer);

  // ✅ public path return karo jo frontend me use hoga
  const publicPath = `/uploads/${uploadPath}/${uniqueName}`;

  return {
    success: true,
    // path: finalPath,
    path: publicPath, // ye URL me use hoga
  };
}
