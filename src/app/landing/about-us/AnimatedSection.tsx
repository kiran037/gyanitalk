// app/landing/AnimatedSection.tsx
"use client";

import React, { ReactNode, CSSProperties, useEffect, useRef } from "react";
import { motion, useAnimation, Variants } from "framer-motion";

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
    // For particle & orb types we only provide a simple visible/hidden state in variants,
    // actual continuous animation will be provided via a separate animate object.
    case "particle":
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
      };
    case "orb1":
      return {
        hidden: { opacity: 0.9, scale: 1 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
      };
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

const getLoopAnimate = (type: AnimType, delay = 0) => {
  if (type === "particle") {
    return {
      opacity: [0.15, 0.4, 0.15],
      scale: [1, 1.8, 1],
      x: [0, (Math.random() * 60 - 30), 0],
      y: [0, (Math.random() * 60 - 30), 0],
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
  const variants = createVariants(type, delay);
  const loopAnim = getLoopAnimate(type, delay);
  const hasLoop = Boolean(loopAnim);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      // fallback: show immediately
      controls.start("visible").catch(() => {});
      return;
    }

    // if already visible on mount, trigger immediately
    if (isInViewport(el)) {
      if (hasLoop) {
        // start looped animation by setting animate to the loop object
        controls.start("visible").then(() => {
          // nothing else required — the component will apply loop animate prop
        }).catch(() => {});
      } else {
        controls.start("visible").catch(() => {});
      }
      return;
    }

    // observe for entry
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
      { root: null, rootMargin: "0px", threshold: 0.03 }
    );

    observer.observe(el);

    // fallback safety: show after a few seconds
    const fallback = window.setTimeout(() => {
      controls.start("visible").catch(() => {});
    }, 4000 + delay * 1000);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, controls, hasLoop]);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      <motion.div
        initial="hidden"
        animate={hasLoop ? loopAnim : controls}
        variants={variants}
        style={style}
      >
        {children}
      </motion.div>
    </div>
  );
}
