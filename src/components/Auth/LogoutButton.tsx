// src/components/Auth/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  className?: string;
  iconOnly?: boolean;
};

export default function LogoutButton({ className = "", iconOnly = false }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const clearClientState = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      // clear non-httpOnly variants too
      document.cookie = "token=; Max-Age=0; path=/";
      document.cookie = "auth_token=; Max-Age=0; path=/";
      document.cookie = "jwt=; Max-Age=0; path=/";
    } catch {}
  };

  const onLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", cache: "no-store" }).catch(() => {});
    } finally {
      clearClientState();
      toast("success", "Signed out", "You have been logged out.");
      router.push("/sign-in");
      router.refresh();
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setConfirmOpen(false)} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl p-6">
        <button
          onClick={() => setConfirmOpen(false)}
          className="absolute top-3 right-3 rounded-lg p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Confirm Logout</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">Are you sure you want to log out?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 dark:bg-slate-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button onClick={onLogout} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700">
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className={[
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
          "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
          "backdrop-blur-md transition-colors hover:bg-white/90 dark:hover:bg-white/[0.12]",
          className,
        ].join(" ")}
        aria-label="Logout"
        type="button"
      >
        <LogOut className="h-4 w-4" />
        {!iconOnly && <span>Logout</span>}
      </button>
      {mounted && confirmOpen && createPortal(modal, document.body)}
    </>
  );
}
