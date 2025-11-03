import { isValidImageUrl } from "@/components/functions";

const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
export const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

export function getFileExtension(file: File | string | null): string {
  if (!file) return "";
  if (file instanceof File) return file.name.split(".").pop()?.toLowerCase() || "";
  if (typeof file === "string") return file.split(".").pop()?.toLowerCase() || "";
  return "";
}

export const isImageExt = (ext?: string) =>
  ["jpg", "jpeg", "gif", "png", "webp", "svg"].includes((ext || "").toLowerCase());

export function bannerSrcOf(item: any) {
  const src = item?.blogImage ?? "";
  if (!isValidImageUrl(src)) return FALLBACK;
  return /^https?:\/\//i.test(src) ? src : `${BASE}${src}`;
}
