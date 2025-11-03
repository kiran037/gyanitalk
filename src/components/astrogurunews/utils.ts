import { isValidImageUrl } from "@/components/functions";
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
export const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

export function bannerSrcOf(item: any) {
  const src = item?.bannerImage ?? "";
  if (!isValidImageUrl(src)) return FALLBACK;
  return /^https?:\/\//i.test(src) ? src : `${BASE}${src}`;
}
