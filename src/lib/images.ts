// /src/lib/images.ts

export function ensureAbs(p?: string | null, fallback = "/placeholder-avatar.png"): string {
  if (!p || typeof p !== "string") return fallback;


  if (/^https?:\/\//i.test(p)) return p;

  const raw = p.replace(/^\/+/, "");
  const base = (process.env.NEXT_PUBLIC_BASEURL || "").replace(/\/+$/, ""); 

  if (base) {

    return `${base}/${raw}`;
  }

  const clean = raw.startsWith("public/") ? raw.replace(/^public\//, "") : raw;
  return `/${clean}`;
}


export function avatar(p?: string | null) {

  const fallback = "https://gyanitalk.com/build/assets/images/person.png";
  return ensureAbs(p, fallback);
}
