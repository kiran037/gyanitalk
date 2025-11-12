// components/Toast/ToastProvider.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Toast, { ToastProps, ToastType } from "./Toast";

interface ToastContextType {
  addToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Use useCallback to memoize removeToast so it doesn't change on every render
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []); // Empty dependency array means this function never changes

  // Use useCallback for addToast as well
  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 8);
    const toast = { id, type, title, message, onClose: removeToast };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]); // Depends on removeToast

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast must be used within a ToastProvider");
  return context.addToast;
}