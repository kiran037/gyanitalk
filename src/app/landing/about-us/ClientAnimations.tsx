// app/landing/about-us/ClientAnimations.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ClientAnimationsProps {
    children: ReactNode;
}

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const fadeInLeft = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
};

const fadeInRight = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function ClientAnimations({ children }: ClientAnimationsProps) {
    return <motion.div initial="initial" animate="animate">{children}</motion.div>;
}

// Export animation variants for use in other components
export { fadeInUp, fadeInLeft, fadeInRight, staggerContainer };