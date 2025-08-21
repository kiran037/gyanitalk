"use server"

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(file) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Ensure uploads folder exists
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.originalFilename || file.newFilename || "");
    const uniqueName = `${uuidv4()}${ext}`;
    const finalPath = path.join(uploadsDir, uniqueName);

    // Move the file from temp to public/uploads
    await fs.promises.rename(file.filepath, finalPath);

    return {
        success: true,
        path: `/uploads/${uniqueName}`
    };
}
