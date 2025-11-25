"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

type Props = {
  loginUser: (formData: FormData) => Promise<{
    ok: true;
    user: { id: number; email: string; name?: string | null };
    loginAt: string;
  }>;
};

export default function SigninWithPassword({ loginUser }: Props) {
  const toast = useToast();
  const [data, setData] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const emailInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus email field on mount
  React.useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return false;
    }
    if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate both fields
    const isEmailValid = validateEmail(data.email);
    const isPasswordValid = validatePassword(data.password);

    if (!isEmailValid || !isPasswordValid) {
      toast("warning", "Something went wrong", "Please enter valid details");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email.trim().toLowerCase());
      formData.append("password", data.password);
      formData.append("remember", String(data.remember));

      const result = await loginUser(formData);

      toast(
        "success",
        "Welcome back!",
        `${result?.user?.name ? `Hi ${result.user.name}!` : "Successfully signed in"}`
      );
      
      // Redirect to home
      window.location.href = "/";
    } catch (err: any) {
      // Show user-friendly error message
      const errorMessage = err?.message || "Unable to sign in. Please try again.";
      toast("error", "Sign in failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Ambient background blobs - matching landing page */}
      <div className="pointer-events-none absolute -top-24 -right-28 h-64 w-64 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB347]/20 blur-3xl animate-pulse" />
      <div
        className="pointer-events-none absolute -bottom-24 -left-28 h-72 w-72 rounded-full bg-gradient-to-tr from-[#FFB347]/20 to-[#FF8C61]/20 blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-2xl p-8">

        <div className="mb-8 text-center">

          <div className="flex justify-center mb-6">
            <img
              src="https://gyanitalk.com/public/storage/images/astrologer_7851728112667.png"
              alt="Gyani Talk"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                ref={emailInputRef}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={data.email}
                onChange={(e) => {
                  setData((s) => ({ ...s, email: e.target.value }));
                  if (errors.email) validateEmail(e.target.value);
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                disabled={loading}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                  errors.email
                    ? "border-red-400 dark:border-red-500"
                    : "border-white/60 dark:border-white/10"
                } bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400"></span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={data.password}
                onChange={(e) => {
                  setData((s) => ({ ...s, password: e.target.value }));
                  if (errors.password) validatePassword(e.target.value);
                }}
                onBlur={(e) => validatePassword(e.target.value)}
                disabled={loading}
                className={`w-full pl-12 pr-12 py-3.5 rounded-xl border ${
                  errors.password
                    ? "border-red-400 dark:border-red-500"
                    : "border-white/60 dark:border-white/10"
                } bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400"></span>
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer group">
              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] group-hover:border-[#FF6B35]/50 transition-colors">
                <input
                  type="checkbox"
                  name="remember"
                  checked={data.remember}
                  onChange={(e) => setData((s) => ({ ...s, remember: e.target.checked }))}
                  disabled={loading}
                  className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
                <span className="pointer-events-none inline-block h-3 w-3 rounded-[4px] bg-gradient-to-r from-[#FF6B35] to-[#FFB347] opacity-0 transition-opacity peer-checked:opacity-100" />
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                Remember me for 30 days
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#FFB347] hover:from-[#FF8C61] hover:to-[#FFCC80] shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#FF6B35] disabled:hover:to-[#FFB347] hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}