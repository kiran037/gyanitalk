"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import PhoneInput from "@/components/adminUI/PhoneInput";
import OTPInput from "@/components/Auth/OTPInput";

type LoginMode = "otp" | "password";

export default function LoginForm() {
  const router = useRouter();

  // Default is OTP
  const [mode, setMode] = useState<LoginMode>("otp");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [passwordData, setPasswordData] = useState({
    identifier: "",
    password: "",
    remember: false,
  });
  const [otpData, setOtpData] = useState({
    contactNo: "",
    countryCode: "+91",
    otp: "",
    remember: false,
  });

  // --- Handlers ---
  const redirectAfterLogin = async () => {
    try {
      const res = await fetch("/api/me");
      const { data } = await res.json();
      const roleIds = data.roles.map((r: any) => parseInt(r.id));
      // Redirect logic based on role
      if (roleIds.includes(2) || roleIds.includes(3)) router.push("/");
      else router.push("/admin/dashboard");
    } catch {
      router.push("/");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!passwordData.identifier || !passwordData.password)
      return setErrors({ form: "Please fill in all fields" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      if (!res.ok) {
        const r = await res.json();
        throw new Error(r.error || "Login failed");
      }
      toast.success("Login successful!");
      await redirectAfterLogin();
    } catch (e: any) {
      toast.error(e.message);
      setErrors({ form: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setErrors({});
    if (!otpData.contactNo)
      return setErrors({ contactNo: "Mobile number required" });
    const cleanNumber = otpData.contactNo.replace(/\D/g, "").slice(-10);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactNo: cleanNumber,
          countryCode: otpData.countryCode,
        }),
      });
      if (!res.ok) {
        const r = await res.json();
        throw new Error(r.error);
      }
      toast.success("OTP sent!");
      setOtpSent(true);
    } catch (e: any) {
      toast.error(e.message);
      setErrors({ form: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData.otp || otpData.otp.length !== 6)
      return setErrors({ otp: "Invalid OTP" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpData),
      });
      if (!res.ok) {
        const r = await res.json();
        throw new Error(r.error);
      }
      toast.success("Welcome back!");
      await redirectAfterLogin();
    } catch (e: any) {
      toast.error(e.message);
      setErrors({ form: e.message });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#FF6B35]/50 focus:bg-white focus:ring-4 focus:ring-[#FF6B35]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-[#FF6B35]";

  return (
    <div>
      {/* Error Message */}
      {errors.form && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/10 dark:text-red-400"
        >
          <span className="block h-1.5 w-1.5 rounded-full bg-red-600"></span>
          {errors.form}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* ================= OTP MODE (DEFAULT) ================= */}
        {mode === "otp" ? (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mobile Number
                  </label>
                  <PhoneInput
                    value={otpData.contactNo}
                    countryCode={otpData.countryCode}
                    onChange={(p, c) => {
                      const digitsOnly = p.replace(/\D/g, "").slice(0, 10);
                      setOtpData((s) => ({
                        ...s,
                        contactNo: digitsOnly,
                        countryCode: c,
                      }));
                    }}
                    error={errors.contactNo}
                  />
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Get OTP"
                  )}
                  {!loading && (
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>
              </>
            ) : (
              <form onSubmit={handleOTPLogin} className="space-y-8">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Enter verification code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs font-bold text-[#FF6B35] hover:underline"
                    >
                      Change number
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <div className="flex gap-3 [&_input]:h-14 [&_input]:w-14 [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-200 [&_input]:bg-gray-50 [&_input]:text-center [&_input]:text-xl [&_input]:font-bold [&_input]:text-gray-900 [&_input]:outline-none [&_input]:transition-all [&_input]:focus:border-[#FF6B35] [&_input]:focus:bg-white [&_input]:focus:ring-2 [&_input]:focus:ring-[#FF6B35]/20 [&_input]:dark:border-gray-700 [&_input]:dark:bg-gray-800 [&_input]:dark:text-white">
                      <OTPInput
                        value={otpData.otp}
                        onChange={(otp) => setOtpData((s) => ({ ...s, otp }))}
                        error={errors.otp}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Verify & Continue"
                  )}
                </button>
              </form>
            )}

            {/* SWITCH TO PASSWORD LINK (Subtle & Generic) */}
            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  setMode("password");
                  setErrors({});
                }}
                className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <KeyRound
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600"
                />
                <span>Log in with password</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ================= PASSWORD MODE (SECONDARY) ================= */
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Standard Generic Form - No "Admin" labels */}
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={passwordData.identifier}
                  onChange={(e) =>
                    setPasswordData((s) => ({
                      ...s,
                      identifier: e.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-[#FF6B35] hover:text-[#e55a2b]"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.password}
                    onChange={(e) =>
                      setPasswordData((s) => ({
                        ...s,
                        password: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-black active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Log in"
                  )}
                </button>
              </div>
            </form>

            {/* SWITCH BACK TO OTP LINK */}
            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  setMode("otp");
                  setErrors({});
                }}
                className="text-sm font-medium text-gray-500 hover:text-[#FF6B35] dark:text-gray-400"
              >
                ← Back to Mobile OTP
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - Generic */}
      {mode === "otp" && (
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            New to GyaniTalk?{" "}
            <Link
              href="/register"
              className="font-bold text-[#FF6B35] hover:underline"
            >
              Create Free Account
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
