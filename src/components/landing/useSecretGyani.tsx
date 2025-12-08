// components/landing/useSecretGyani.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SECRET = "gyani";
const TIME_WINDOW_MS = 3000; // must type within 3 seconds

export function useSecretGyani() {
  const router = useRouter();
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Debug: see if handler even fires
      // console.log("keydown:", e.key);

      const now = Date.now();
      const key = e.key.toLowerCase();

      // only letters a–z
      if (!/^[a-z]$/.test(key)) return;

      // reset if too slow
      if (
        lastKeyTimeRef.current !== null &&
        now - lastKeyTimeRef.current > TIME_WINDOW_MS
      ) {
        bufferRef.current = "";
      }

      bufferRef.current = (bufferRef.current + key).slice(-SECRET.length);
      lastKeyTimeRef.current = now;

      // Debug: see buffer progress
      // console.log("buffer:", bufferRef.current);

      if (bufferRef.current === SECRET) {
        // 🔐 change this to your secret route
        router.push("/sign-in");
        bufferRef.current = "";
        lastKeyTimeRef.current = null;
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [router]);
}
