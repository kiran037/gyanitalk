// src/components/Auth/SigninWithPassword.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { useToast } from "@/components/Toast/ToastProvider";

const cx = (...c: Array<string | number | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

function GlassCard({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-3xl",
        "bg-white/55 dark:bg-white/[0.06] border border-white/50 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(2,6,23,0.10)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.06] dark:via-white/[0.03]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function GlassButton({
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
        "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        "shadow-[0_10px_30px_rgba(59,130,246,0.28)] transition-all focus:outline-none",
        className
      )}
    >
      {children}
    </button>
  );
}

function GlassCheckbox({
  checked,
  onChange,
  label,
  name,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  name?: string;
}) {
  return (
    <label className="inline-flex select-none items-center gap-2">
      <span
        className={cx(
          "relative inline-flex h-5 w-5 items-center justify-center rounded-md border",
          "bg-white/70 dark:bg-white/[0.08] border-white/60 dark:border-white/10"
        )}
      >
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 cursor-pointer opacity-0"
        />
        <span className="pointer-events-none inline-block h-3 w-3 rounded-[4px] bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

function GlassInput({
  icon,
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  label?: string;
}) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </span>
      ) : null}
      <div
        className={cx(
          "relative w-full rounded-xl border border-white/60 dark:border-white/10",
          "bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl"
        )}
      >
        {icon ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 text-slate-500 dark:text-slate-400">{icon}</div>
          </div>
        ) : null}

        <input
          {...props}
          className={cx(
            "w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-500 dark:placeholder:text-slate-400",
            "px-3 py-3",
            !!icon && "pl-10",
            className
          )}
        />
      </div>
    </label>
  );
}

type Props = {
  loginUser: (formData: FormData) => Promise<{ ok: true; user: { id: number; email: string; name?: string | null }; loginAt: string }>;
};

export default function SigninWithPassword({ loginUser }: Props) {
  const toast = useToast();
  const [data, setData] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.email.trim() || !data.password.trim()) {
      toast("warning", "Missing info", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("remember", String(data.remember));

      const result = await loginUser(formData);

      toast("success", "Signed in", `Welcome back${result?.user?.name ? `, ${result.user.name}` : ""}!`);
      // Let the server cookie be authoritative. Just go home:
      window.location.href = "/";
    } catch (err: any) {
      toast("error", "Login failed", err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute -top-24 -right-28 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-28 h-72 w-72 rounded-full bg-gradient-to-tr from-purple-400/20 to-pink-400/20 blur-3xl" />

      <GlassCard className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            type="email"
            name="email"
            autoComplete="email"
            label="Email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => setData((s) => ({ ...s, email: e.target.value }))}
            icon={<EmailIcon />}
          />

          <GlassInput
            type="password"
            name="password"
            autoComplete="current-password"
            label="Password"
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => setData((s) => ({ ...s, password: e.target.value }))}
            icon={<PasswordIcon />}
          />

          <div className="flex items-center justify-between pt-1">
            <GlassCheckbox
              name="remember"
              label="Remember me"
              checked={data.remember}
              onChange={(v) => setData((s) => ({ ...s, remember: v }))}
            />
            <a
              href="/auth/forgot-password"
              className="text-sm text-slate-700 hover:underline dark:text-slate-300"
            >
              Forgot password?
            </a>
          </div>

          <GlassButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
