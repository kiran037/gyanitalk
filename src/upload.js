"use server";

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name || "");
    const uniqueName = `${uuidv4()}${ext}`;
    const finalPath = path.join(uploadsDir, uniqueName);

    await fs.promises.writeFile(finalPath, buffer);

    return {
        success: true,
        path: `/uploads/${uniqueName}`,
    };
}
