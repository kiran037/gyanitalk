// src/components/Auth/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  className?: string;
  iconOnly?: boolean;
  onLogoutClick?: () => void;
};

export default function LogoutButton({ className = "", iconOnly = false, onLogoutClick }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const clearClientState = () => {
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear specific items just in case
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Clear all possible cookie variants on client side
      const cookiesToClear = ["token", "auth_token", "jwt", "session", "accessToken"];
      cookiesToClear.forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    } catch (error) {
      console.error("Error clearing client state:", error);
    }
  };

  const onLogout = async () => {
    setConfirmOpen(false);
    try {
      clearClientState();
      const response = await fetch("/api/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const result = await response.json();
      toast("success", "Signed out", "You have been logged out successfully.");
      setTimeout(() => {
        window.location.replace("/sign-in");
      }, 300);

    } catch (error) {
      clearClientState();
      setTimeout(() => {
        window.location.replace("/sign-in");
      }, 300);
    }
  };

  const handleOpenConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Opening logout confirmation modal");
    setConfirmOpen(true);
    onLogoutClick?.();
  };

  const modal = (
    <div id="logout-modal" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setConfirmOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl sm:rounded-3xl border border-white/20 dark:border-gray-700/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => setConfirmOpen(false)}
          className="absolute top-4 right-4 rounded-xl p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-2xl flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Confirm Logout
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 text-center">
          Are you sure you want to log out of your account?
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all shadow-md hover:shadow-lg"
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF5722] hover:to-[#FF6B35] hover:shadow-xl hover:shadow-[#FF6B35]/30 hover:scale-105 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={handleOpenConfirm}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all ${className}`}
        aria-label="Logout"
        type="button"
      >
        <LogOut className="h-5 w-5 text-[#FF6B35] dark:text-[#FF8C61]" />
        {!iconOnly && <span>Logout</span>}
      </button>
      {mounted && confirmOpen && createPortal(modal, document.body)}
    </>
  );
}