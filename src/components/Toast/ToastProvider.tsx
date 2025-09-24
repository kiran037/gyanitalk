// components/Toast/ToastProvider.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast, { ToastProps, ToastType } from "./Toast";

interface ToastContextType {
  addToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (type: ToastType, title: string, message: string) => {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 8);
    const toast = { id, type, title, message, onClose: removeToast };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

// import { useToast } from "@/components/Toast/ToastProvider";
//   const toast = useToast();
//   toast("error", "Error", "Upload failed. Please try again.")
//    toast("warning", "Warning", "Please fill required fields: Title, File Upload, and Price.")
//     toast("error", "Error", "Failed to save ebook: " + (err.error || "Unknown error"))
//     toast("info", "Error", "Failed to save ebook: " + (err.error || "Unknown error"))
//     toast("success", "Error", "Failed to save ebook: " + (err.error || "Unknown error"))

