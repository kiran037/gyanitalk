export function isValidImageUrl(url: string | undefined | null): boolean {
    if (!url || typeof url !== "string") return false;
  
    try {
      const parsedUrl = new URL(url, process.env.NEXT_PUBLIC_BASEURL);
      return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(parsedUrl.pathname);
    } catch (e) {
      return false;
    }
  }
  