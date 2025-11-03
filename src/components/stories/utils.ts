export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

export function buildImg(val?: string | null) {
  if (!val) return FALLBACK;
  const isHttp = /^https?:\/\//i.test(val);
  return isHttp ? val : `${BASE}${val}`;
}
