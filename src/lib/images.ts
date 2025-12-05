

export function ensureAbs(p?: string | null, fallback = "/placeholder-avatar.png"): string {
  if (!p || typeof p !== "string") return fallback;

  // Already a full URL → return as-is
  if (/^https?:\/\//i.test(p)) return p;

  // NEW: Use S3 base URL
  const base =
    process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
    process.env.NEXT_PUBLIC_BASEURL || ""; // fallback if needed

  const cleanedBase = base.replace(/\/+$/, ""); // remove trailing slash
  const cleanedPath = p.replace(/^\/+/, "");    // remove leading slash

  if (cleanedBase) {
    // S3 / CDN full URL
    return `${cleanedBase}/${cleanedPath}`;
  }

  // If still no base → treat as local public/ file
  const localPath = cleanedPath.startsWith("public/")
    ? cleanedPath.replace(/^public\//, "")
    : cleanedPath;

  return `/${localPath}`;
}

export function avatar(p?: string | null) {
  const fallback = "https://gyanitalk.com/build/assets/images/person.png";
  return ensureAbs(p, fallback);
}
