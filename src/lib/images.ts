// /src/lib/images.ts
/** Build an absolute, browser-usable src for images stored in DB.
 * - If p is a full URL (http(s)...) return as-is.
 * - If NEXT_PUBLIC_BASEURL is provided (S3/CDN), return `${BASE}/${p}` (keep DB 'public/' prefix).
 * - If no BASE, assume files are in your Next `public/` folder and return absolute-from-root path:
 *     DB: "public/storage/..." -> "/storage/..."
 *     DB: "storage/..."        -> "/storage/..."
 * - Always return a sensible fallback if p is falsy.
 */
export function ensureAbs(p?: string | null, fallback = "/placeholder-avatar.png"): string {
  if (!p || typeof p !== "string") return fallback;

  // already an absolute URL
  if (/^https?:\/\//i.test(p)) return p;

  const raw = p.replace(/^\/+/, ""); // remove leading slashes for consistent handling
  const base = (process.env.NEXT_PUBLIC_BASEURL || "").replace(/\/+$/, ""); // no trailing slash

  if (base) {
    // If a base is configured (S3 / CDN), build BASE + "/" + raw
    // Keep the DB value intact (so "public/storage/..." becomes ".../public/storage/...")
    return `${base}/${raw}`;
  }

  // No base: serve from app's public/ folder.
  // If DB stored "public/storage/..." -> strip "public/" and return "/storage/..."
  const clean = raw.startsWith("public/") ? raw.replace(/^public\//, "") : raw;
  return `/${clean}`;
}

/** Convenience avatar helper: fallback to a default image if necessary */
export function avatar(p?: string | null) {
  // external fallback same as admin UI
  const fallback = "https://gyanitalk.com/build/assets/images/person.png";
  return ensureAbs(p, fallback);
}
