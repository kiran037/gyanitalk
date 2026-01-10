"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import PhoneInput from "@/components/adminUI/PhoneInput";
import OTPInput from "@/components/Auth/OTPInput";

type LoginMode = "password" | "otp";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [passwordData, setPasswordData] = useState({ identifier: "", password: "", remember: false });
  const [otpData, setOtpData] = useState({ contactNo: "", countryCode: "+91", otp: "", remember: false });

  // --- Auth Handlers ---
  const redirectAfterLogin = async () => {
    try {
      const res = await fetch("/api/me");
      const { data } = await res.json();
      const roleIds = data.roles.map((r: any) => parseInt(r.id));
      if (roleIds.includes(2) || roleIds.includes(3)) router.push("/");
      else router.push("/admin/dashboard");
    } catch { router.push("/"); }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!passwordData.identifier || !passwordData.password) return setErrors({ form: "Please fill in all fields" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error || "Login failed"); }
      toast.success("Login successful!");
      await redirectAfterLogin();
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    setErrors({});
    if (!otpData.contactNo) return setErrors({ contactNo: "Mobile number required" });
    
    // STRICTLY get the last 10 digits to remove country code
    const cleanNumber = otpData.contactNo.replace(/\D/g, "").slice(-10);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            contactNo: cleanNumber, 
            countryCode: otpData.countryCode 
        }),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("OTP sent!");
      setOtpSent(true);
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData.otp || otpData.otp.length !== 6) return setErrors({ otp: "Invalid OTP" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpData),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("Welcome back!");
      await redirectAfterLogin();
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* 1. Toggle Switch */}
      <div className="mb-8 flex gap-6 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => { setMode("password"); setErrors({}); }}
          className={`pb-3 text-sm font-semibold transition-all ${
            mode === "password" 
              ? "border-b-2 border-[#FF6B35] text-gray-900 dark:text-white" 
              : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
          }`}
        >
          Password Login
        </button>
        <button
          onClick={() => { setMode("otp"); setErrors({}); }}
          className={`pb-3 text-sm font-semibold transition-all ${
            mode === "otp" 
              ? "border-b-2 border-[#FF6B35] text-gray-900 dark:text-white" 
              : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
          }`}
        >
          OTP Login
        </button>
      </div>

      {/* 2. Error Message */}
      {errors.form && (
        <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
          {errors.form}
        </div>
      )}

      {/* 3. Forms */}
      <AnimatePresence mode="wait">
        {mode === "password" ? (
          <motion.form
            key="password"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handlePasswordLogin}
            className="space-y-5"
          >
            {/* Input: Identifier */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email or Mobile
              </label>
              <input
                type="text"
                value={passwordData.identifier}
                onChange={(e) => setPasswordData(s => ({ ...s, identifier: e.target.value }))}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Input: Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#FF6B35] hover:underline">
                    Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData(s => ({ ...s, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
                <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Log in"}
                </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {!otpSent ? (
                <>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mobile Number
                        </label>
                        <PhoneInput 
                            value={otpData.contactNo}
                            countryCode={otpData.countryCode}
                            onChange={(p, c) => setOtpData(s => ({...s, contactNo: p, countryCode: c}))}
                            error={errors.contactNo}
                        />
                    </div>
                    <button
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Send OTP"}
                    </button>
                </>
            ) : (
                <form onSubmit={handleOTPLogin} className="space-y-6">
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter code</label>
                            <button 
                                type="button" 
                                onClick={() => setOtpSent(false)} 
                                className="text-xs font-semibold text-[#FF6B35] hover:underline"
                            >
                                Change number
                            </button>
                        </div>
                        <div className="flex justify-center gap-2 [&_input]:h-12 [&_input]:w-12 [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-300 [&_input]:bg-white [&_input]:text-center [&_input]:text-lg [&_input]:font-bold [&_input]:text-gray-900 [&_input]:outline-none [&_input]:transition-all [&_input]:focus:border-gray-500 [&_input]:focus:ring-1 [&_input]:focus:ring-gray-200 [&_input]:dark:border-gray-600 [&_input]:dark:bg-gray-800 [&_input]:dark:text-white">
                            <OTPInput 
                                value={otpData.otp}
                                onChange={(otp) => setOtpData(s => ({...s, otp}))}
                                error={errors.otp}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Log in"}
                    </button>
                </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 4. Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-[#FF6B35] hover:underline">
                Register
            </Link>
        </p>
      </div>
    </div>
  );
}