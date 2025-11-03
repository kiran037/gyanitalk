import { isValidImageUrl } from "@/components/functions";
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
export const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

export function coverSrc(val?: string | null) {
  if (!isValidImageUrl(val || "")) return FALLBACK;
  return /^https?:\/\//i.test(val!) ? (val as string) : `${BASE}${val}`;
}
