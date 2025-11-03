import { isValidImageUrl } from "@/components/functions";
import type { BannerType } from "../../types/banners";

const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
export const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

export function bannerSrc(val?: string | null) {
  if (!isValidImageUrl(val || "")) return FALLBACK;
  return /^https?:\/\//i.test(val!) ? (val as string) : `${BASE}${val}`;
}

/** Parse aspect ratio from type.dimensions or name heuristics */
export function aspectForType(t?: BannerType): { w: number; h: number } {
  // explicit WxH: "1080x1920"
  const d = (t?.dimensions || "").trim().toLowerCase();
  const m = d.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (m) {
    const w = parseInt(m[1], 10), h = parseInt(m[2], 10);
    if (w > 0 && h > 0) return { w, h };
  }
  // explicit ratio like "16:9"
  const r = d.match(/(\d+)\s*[:/]\s*(\d+)/);
  if (r) {
    const w = parseInt(r[1], 10), h = parseInt(r[2], 10);
    if (w > 0 && h > 0) return { w, h };
  }

  // name-based heuristics
  const name = (t?.name || "").toLowerCase();
  if (name.includes("story") || name.includes("reel") || name.includes("vertical")) return { w: 9, h: 16 };
  if (name.includes("square")) return { w: 1, h: 1 };
  if (name.includes("banner") || name.includes("slider") || name.includes("landscape")) return { w: 16, h: 9 };

  // default
  return { w: 16, h: 9 };
}

/** Turn w,h into a Tailwind aspect-[w/h] (custom) */
export function aspectClass(w: number, h: number) {
  return `aspect-[${w}/${h}]`;
}
