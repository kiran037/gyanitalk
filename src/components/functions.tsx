export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    // ✅ If it's already a full URL, parse it directly
    if (/^https?:\/\//i.test(url)) {
      const parsedUrl = new URL(url);
      return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(parsedUrl.pathname);
    }
    
    // ✅ If it's a relative path, construct with base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASEURL;
    if (!baseUrl) return false;
    
    const parsedUrl = new URL(url, baseUrl);
    return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(parsedUrl.pathname);
  } catch (e) {
    return false;
  }
}

export function formatDatetoReadable(d: unknown) {
  if (!d) return "-";
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : (d as Date);
  return isNaN(date as unknown as number)
    ? String(d)
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}