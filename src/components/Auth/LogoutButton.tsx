"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

type Props = {
  className?: string;
  iconOnly?: boolean;
};

export default function LogoutButton({ className = "", iconOnly = false }: Props) {
  const router = useRouter();
  const toast = useToast();

  const clearClientState = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      // best-effort client cookie clear (server route also clears it)
      document.cookie = "token=; Max-Age=0; path=/";
    } catch {
      // no-op
    }
  };

  const onLogout = async () => {
    try {
      // Ask the server to clear cookie
      await fetch("/api/logout", { method: "POST" }).catch(() => {});
    } finally {
      clearClientState();
      toast("success", "Signed out", "You have been logged out.");
      router.push("/sign-in");
      router.refresh();
    }
  };

  return (
    <button
      onClick={onLogout}
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
  );
}
