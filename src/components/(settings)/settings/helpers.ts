import { Image as ImageIcon, Radio as RadioIcon, FileText, Hash, Palette, Globe, Shield, Zap, Settings } from "lucide-react";

export const isMasterImageGroup = (g: { flagGroupName: string | null }) =>
  (g.flagGroupName ?? "").toLowerCase().includes("masterimage");

export const buildImgSrc = (val?: string | null) => {
  if (!val) return "/placeholder.svg";
  if (val.startsWith("blob:") || val.startsWith("data:") || /^https?:\/\//i.test(val)) return val;
  return `${process.env.NEXT_PUBLIC_BASEURL || ""}${val}`;
};

export const getTypeIcon = (type?: string) => {
  switch ((type || "").toLowerCase()) {
    case "file":
      return ImageIcon;
    case "radio":
      return RadioIcon;
    case "number":
      return Hash;
    case "text":
      return FileText;
    default:
      return FileText;
  }
};

export const getGroupIcon = (name?: string) => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("image") || lower.includes("media")) return Palette;
  if (lower.includes("security") || lower.includes("auth")) return Shield;
  if (lower.includes("api") || lower.includes("service")) return Globe;
  if (lower.includes("performance") || lower.includes("cache")) return Zap;
  return Settings;
};
