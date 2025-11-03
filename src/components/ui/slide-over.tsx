"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export default function SlideOver({
    open,
    onClose,
    children,
    widthClass = "w-full sm:w-[28rem]",
    title,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    widthClass?: string;
    title?: string;
}) {
    // 🚫 Don’t portal during SSR/hydration
    const [mounted, setMounted] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setMounted(true);
        setPortalRoot(document.body); // you can target a custom div if you prefer
    }, []);

    useEffect(() => {
        if (!open) return;
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [open, onClose]);

    // SSR (server render) & initial hydration on client: render nothing
    if (!mounted || !portalRoot) return null;

    // Client after mounted: safe to portal
    return createPortal(
        <div
            className={cn(
                "fixed inset-0 z-50 transition",
                open ? "pointer-events-auto" : "pointer-events-none"
            )}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={cn(
                    "absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity",
                    open ? "opacity-100" : "opacity-0"
                )}
            />
            {/* Panel */}
            <div
                className={cn(
                    "absolute right-0 top-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl transform transition-transform",
                    widthClass,
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{title ?? "Details"}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-2 py-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100%-3rem)]">{children}</div>
            </div>
        </div>,
        portalRoot
    );
}
