import { useEffect, useState } from "react";

export const MOBILE_BREAKPOINT = 850;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Run on mount
    checkMobile();

    // Subscribe to changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", checkMobile);

    return () => mql.removeEventListener("change", checkMobile);
  }, []);

  return isMobile;
}
