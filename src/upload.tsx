// "use server";

// import fs from "fs";
// import path from "path";

// export async function uploadImage(
//   file: File,
//   uploadPath: string,
//   newPath?: string
// ) {
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   const baseDir =
//     newPath && newPath.trim() !== ""
//       ? newPath
//       : process.env.UPLOAD_PATH;

//   if (!baseDir) {
//     throw new Error("UPLOAD_PATH not defined in environment variables");
//   }

//   const timestamp = Date.now();
//   const uploadsDir = path.join(baseDir, uploadPath);

//   if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
//   }

//   const ext = path.extname(file.name || ".png");
//   const uniqueName = `${timestamp}${ext}`;
//   const finalPath = path.join(uploadsDir, uniqueName);

//   await fs.promises.writeFile(finalPath, buffer);

//   // ✅ public path
//   const publicPath = `/uploads/${uploadPath}/${uniqueName}`;

//   return {
//     success: true,
//     mainPath: `${newPath}/${uploadPath}/${uniqueName}`,
//     path: publicPath, //local path
//   };
// }


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
      : process.env.UPLOAD_PATH;

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

  // ✅ Return ONLY relative path - let bannerSrcOf handle the full URL
  const relativePath = `public/storage/${uploadPath}/${uniqueName}`;

  return {
    success: true,
    mainPath: `${newPath}/${uploadPath}/${uniqueName}`,
    path: relativePath, // ✅ Returns: public/storage/images/xxx.png
  };
}