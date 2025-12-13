
// ///Users/xeoren/gyanitallk-admin/src/lib/images.ts
// export function ensureAbs(p?: string | null, fallback = "/default-avatar.svg"): string {
//   if (!p || typeof p !== "string") return fallback;

//   // Already a full URL → return as-is
//   if (/^https?:\/\//i.test(p)) return p;

//   // NEW: Use S3 base URL
//   const base =
//     process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
//     process.env.NEXT_PUBLIC_BASEURL || ""; // fallback if needed

//   const cleanedBase = base.replace(/\/+$/, ""); // remove trailing slash
//   const cleanedPath = p.replace(/^\/+/, "");    // remove leading slash

//   if (cleanedBase) {
//     // S3 / CDN full URL
//     return `${cleanedBase}/${cleanedPath}`;
//   }

//   // If still no base → treat as local public/ file
//   const localPath = cleanedPath.startsWith("public/")
//     ? cleanedPath.replace(/^public\//, "")
//     : cleanedPath;

//   return `/${localPath}`;
// }

// export function avatar(p?: string | null) {
//   const fallback = "/default-avatar.svg";
//   return ensureAbs(p, fallback);
// }

// /Users/xeoren/gyanitallk-admin/src/lib/images.ts

export function ensureAbs(p?: string | null, fallback = "/default-avatar.svg"): string {
  if (!p || typeof p !== "string") return fallback;

  // Already a full URL → return as-is
  if (/^https?:\/\//i.test(p)) return p;

  // Normalize path early (IMPORTANT)
  const cleanedPath = p.replace(/^\/+/, ""); // remove ALL leading slashes

  // Use S3 base URL if available
  const base =
    process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
    process.env.NEXT_PUBLIC_BASEURL ||
    "";

  const cleanedBase = base.replace(/\/+$/, ""); // remove trailing slashes

  if (cleanedBase) {
    // Build full CDN/S3 URL
    return `${cleanedBase}/${cleanedPath}`;
  }

  // Local public folder fallback
  const localPath = cleanedPath.startsWith("public/")
    ? cleanedPath.replace(/^public\//, "")
    : cleanedPath;

  return `/${localPath}`;
}

export function avatar(p?: string | null) {
  return ensureAbs(p, "/default-avatar.svg");
}