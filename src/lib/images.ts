///Users/xeoren/Desktop/gyanitallk-admin/src/lib/images.ts
export function ensureAbs(path?: string | null, fallback = "/default-avatar.svg"): string {
  // 1. Safety Check: If empty, return fallback
  if (!path || typeof path !== "string" || path.trim() === "") {
    return fallback;
  }

  // 2. CONFIG: Your S3 Bucket URL
  const S3_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/+$/, "") 
    || "https://gyanitalk.s3.ap-south-1.amazonaws.com";

  // 3. CONFIG: Legacy App Domain (to strip out if present in DB)
  const LEGACY_DOMAIN = "https://app.gyanitalk.com";

  // --- LOGIC START ---

  // 4. Check if it is ALREADY a valid S3 URL
  if (path.includes("gyanitalk.s3.ap-south-1.amazonaws.com")) {
    return path;
  }

  // 5. Strip the Legacy Domain (if the DB saved the full local URL)
  let cleanPath = path.replace(LEGACY_DOMAIN, "").replace("http://app.gyanitalk.com", "");

  // 6. Check for External URLs (e.g., Google Auth, Facebook, Twitter images)
  // We check this AFTER stripping legacy domain to ensure we don't return app.gyanitalk.com URLs
  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  // 7. Normalize Slashes: Remove ALL leading slashes
  // Example: "/public/storage/..." becomes "public/storage/..."
  cleanPath = cleanPath.replace(/^\/+/, "");

  // 8. CRITICAL: Handle the "public" folder duplication
  // Your DB has "public/storage" or "/public/storage".
  // We want to force the structure, so we remove "public/" from the start first.
  if (cleanPath.startsWith("public/")) {
    cleanPath = cleanPath.replace(/^public\//, "");
  }

  // 9. Rebuild the Full S3 URL
  // We explicitly add "/public/" here to match your S3 bucket structure.
  return `${S3_BASE}/public/${cleanPath}`;
}

export function avatar(p?: string | null) {
  return ensureAbs(p, "/default-avatar.svg");
}