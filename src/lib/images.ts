///Users/xeoren/Desktop/gyanitallk-admin/src/lib/images.ts
export function ensureAbs(path?: string | null, fallback = "/default-avatar.svg"): string {
  if (!path || typeof path !== "string" || path.trim() === "") {
    return fallback;
  }

  const S3_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/+$/, "") 
    || "https://gyanitalk.s3.ap-south-1.amazonaws.com";

  const LEGACY_DOMAIN = "https://app.gyanitalk.com";

  if (path.includes("gyanitalk.s3.ap-south-1.amazonaws.com")) {
    return path;
  }

  let cleanPath = path.replace(LEGACY_DOMAIN, "").replace("http://app.gyanitalk.com", "");

  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  cleanPath = cleanPath.replace(/^\/+/, "");

  if (cleanPath.startsWith("public/")) {
    cleanPath = cleanPath.replace(/^public\//, "");
  }

  return `${S3_BASE}/public/${cleanPath}`;
}

export function avatar(p?: string | null) {
  return ensureAbs(p, "/default-avatar.svg");
}