// src/upload.ts
export async function uploadImage(
  file: File,
  uploadPath: string,
  newPath?: string
) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("uploadPath", uploadPath);
  if (newPath) fd.append("newPath", newPath);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}