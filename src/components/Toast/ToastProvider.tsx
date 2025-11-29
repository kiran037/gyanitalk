// components/Toast/ToastProvider.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Toast, { ToastProps, ToastType } from "./Toast";

interface ToastContextType {
  addToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message: string) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 8);
      const toast = { id, type, title, message, onClose: removeToast };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container with floating orbs */}
      <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
        {/* Ambient floating orbs */}
        {toasts.length > 0 && (
          <>
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B35] rounded-full blur-3xl opacity-20 pointer-events-none"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -top-32 -right-12 w-32 h-32 bg-[#FFB347] rounded-full blur-2xl opacity-20 pointer-events-none"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* Toasts stack */}
        <div className="relative space-y-3 pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast, index) => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.05,
                  },
                }}
                exit={{
                  opacity: 0,
                  x: 100,
                  scale: 0.8,
                  transition: {
                    duration: 0.2,
                  },
                }}
              >
                <Toast {...toast} onClose={removeToast} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context.addToast;
}