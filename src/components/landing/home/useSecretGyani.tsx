"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SECRET = process.env.NEXT_PUBLIC_SECRET_KEYWORD ?? "gyani";
const TIME_WINDOW_MS = 3000;

export function useSecretGyani() {
  const router = useRouter();
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.visibilityState !== "visible") return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();
      const key = e.key.toLowerCase();

      if (!/^[a-z]$/.test(key)) return;

      if (
        lastKeyTimeRef.current !== null &&
        now - lastKeyTimeRef.current > TIME_WINDOW_MS
      ) {
        bufferRef.current = "";
      }

      bufferRef.current = (bufferRef.current + key).slice(-SECRET.length);
      lastKeyTimeRef.current = now;

      if (bufferRef.current === SECRET && !triggeredRef.current) {
        triggeredRef.current = true;
        router.push("/login");

        bufferRef.current = "";
        lastKeyTimeRef.current = null;

        setTimeout(() => {
          triggeredRef.current = false;
        }, 1000);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);
}