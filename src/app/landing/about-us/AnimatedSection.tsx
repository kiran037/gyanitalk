// app/landing/AnimatedSection.tsx
"use client";

import React, { ReactNode, CSSProperties, useEffect, useRef } from "react";
import {
  motion,
  useAnimation,
  Variants,
  useReducedMotion,
} from "framer-motion";

type AnimType =
  | "fadeInUp"
  | "fadeInLeft"
  | "fadeInRight"
  | "scale"
  | "particle"
  | "orb1"
  | "orb2";

interface AnimatedSectionProps {
  children: ReactNode;
  type?: AnimType;
  delay?: number; // seconds
  style?: CSSProperties;
}

const createVariants = (type: AnimType, delay = 0): Variants => {
  switch (type) {
    case "fadeInUp":
      return {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
      };
    case "fadeInLeft":
      return {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay } },
      };
    case "fadeInRight":
      return {
        hidden: { opacity: 0, x: 30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay } },
      };
    case "scale":
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay } },
      };
    case "particle":
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
      };
    case "orb1":
    case "orb2":
      return {
        hidden: { opacity: 0.9, scale: 1 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
      };
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4, delay } },
      };
  }
};

// deterministic pseudo-random based on key-ish number so particles don't jump
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const getLoopAnimate = (type: AnimType, seed: number, delay = 0) => {
  if (type === "particle") {
    const randX = pseudoRandom(seed) * 60 - 30;
    const randY = pseudoRandom(seed + 42) * 60 - 30;
    return {
      opacity: [0.15, 0.4, 0.15],
      scale: [1, 1.8, 1],
      x: [0, randX, 0],
      y: [0, randY, 0],
      transition: {
        duration: 12 + delay,
        repeat: Infinity,
        delay,
        ease: "easeInOut" as const,
      },
    };
  }
  if (type === "orb1") {
    return {
      scale: [1, 1.2, 1],
      x: [0, 50, 0],
      y: [0, 30, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    };
  }
  if (type === "orb2") {
    return {
      scale: [1, 1.3, 1],
      x: [0, -30, 0],
      y: [0, 50, 0],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: 1,
      },
    };
  }
  return undefined;
};

function isInViewport(el: Element | null) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh && rect.bottom >= 0;
}

export default function AnimatedSection({
  children,
  type = "fadeInUp",
  delay = 0,
  style,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

const variants = createVariants(type, delay);
const seedRef = useRef<number>(Date.now() + Math.random()); // stable per instance
const seed = seedRef.current;
const isLoopType = type === "particle" || type === "orb1" || type === "orb2";

  // If user prefers reduced motion: no fancy anim, just show content
  if (shouldReduceMotion) {
    return (
      <div style={{ display: "contents" }}>
        <div style={style}>{children}</div>
      </div>
    );
  }

  // Looping background types: no intersection observer needed
// Looping background types: no intersection observer needed
if (isLoopType) {
  const loopAnim = getLoopAnimate(type, seed, delay);
  return (
    <div ref={ref} style={{ display: "contents" }}>
      <motion.div
        initial="hidden"
        animate={loopAnim}
        variants={variants}
        style={style}
      >
        {children}
      </motion.div>
    </div>
  );
}

  // Normal one-time scroll-into-view animations
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      controls.start("visible").catch(() => {});
      return;
    }

    if (isInViewport(el)) {
      controls.start("visible").catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            controls.start("visible").catch(() => {});
            observer.unobserve(el);
            break;
          }
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.05 }
    );

    observer.observe(el);

    const fallback = window.setTimeout(() => {
      controls.start("visible").catch(() => {});
    }, 4000 + delay * 1000);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [controls, delay]);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      <motion.div
        initial="hidden"
        animate={controls}
        variants={variants}
        style={style}
      >
        {children}
      </motion.div>
    </div>
  );
}