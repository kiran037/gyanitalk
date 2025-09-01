export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    const parsedUrl = new URL(url, process.env.NEXT_PUBLIC_BASEURL);
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
