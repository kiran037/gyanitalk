// src/components/customers/utils.ts
export const isValidImageUrl = (url?: string) => {
  if (!url) return false;
  try {
    const u = new URL(url, process.env.NEXT_PUBLIC_BASEURL);
    return /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(u.pathname);
  } catch {
    return false;
  }
};

export const avatarSrc = (profile?: string) =>
  isValidImageUrl(profile)
    ? `${process.env.NEXT_PUBLIC_BASEURL}${profile}`
    : "https://gyanitalk.com/build/assets/images/person.png";

export const toINR = (n: any) => `₹${Number(n || 0).toFixed(2)}`;

export const buildPageHref = ({
  page,
  search,
  startDate,
  endDate,
}: {
  page: number;
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search) params.set("search", search);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return `?${params.toString()}`;
};
