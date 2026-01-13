"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, Loader2, ArrowRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "@/components/adminUI/PhoneInput";
import OTPInput from "@/components/Auth/OTPInput";

type Step = 1 | 2 | 3;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data
  const [mobileData, setMobileData] = useState({ contactNo: "", countryCode: "+91" });
  const [otp, setOtp] = useState("");
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  // --- Password Strength Logic ---
  useEffect(() => {
    const pass = passwordData.newPassword;
    let score = 0;
    if (!pass) { setStrength(0); return; }

    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25; // Uppercase
    if (/[0-9]/.test(pass)) score += 25; // Number
    if (/[^A-Za-z0-9]/.test(pass)) score += 25; // Special char

    setStrength(score);
  }, [passwordData.newPassword]);

  const getStrengthLabel = () => {
    if (strength === 0) return { label: "", color: "bg-gray-200" };
    if (strength <= 25) return { label: "Weak", color: "bg-red-500" };
    if (strength <= 50) return { label: "Fair", color: "bg-orange-500" };
    if (strength <= 75) return { label: "Good", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const strengthInfo = getStrengthLabel();

  // --- Handlers ---

  const handleSendOTP = async () => {
    setErrors({});
    if (!mobileData.contactNo) return setErrors({ contactNo: "Mobile number required" });

    // Clean number
    const cleanNumber = mobileData.contactNo.replace(/\D/g, "").slice(-10);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactNo: cleanNumber, countryCode: mobileData.countryCode }),
      });

      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("Verification code sent!");
      setStep(2);
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = () => {
    setErrors({});
    if (!otp || otp.length !== 6) return setErrors({ otp: "Enter valid 6-digit OTP" });
    // In production, you might verify OTP server-side here
    setStep(3);
  };

  const handleResetPassword = async () => {
    setErrors({});
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) return setErrors({ newPassword: "Password must be at least 8 characters" });
    if (passwordData.newPassword !== passwordData.confirmPassword) return setErrors({ confirmPassword: "Passwords do not match" });

    const cleanNumber = mobileData.contactNo.replace(/\D/g, "").slice(-10);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactNo: cleanNumber,
          countryCode: mobileData.countryCode,
          otp,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("Password reset successful!");
      router.push("/login");
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  const inputClasses = "w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#FF6B35]/50 focus:bg-white focus:ring-4 focus:ring-[#FF6B35]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-[#FF6B35]";

  return (
    <div>
      {errors.form && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/10 dark:text-red-400"
        >
          {errors.form}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Mobile Input */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Mobile Number</label>
                <PhoneInput
                    value={mobileData.contactNo}
                    countryCode={mobileData.countryCode}
                    onChange={(p, c) => setMobileData({ contactNo: p, countryCode: c })}
                    error={errors.contactNo}
                />
            </div>

            <button
                onClick={handleSendOTP}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Get Verification Code"}
                {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
            </button>
            
            {/* Main Back Button */}
            <div className="text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to Login
                </Link>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div>
               <h3 className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-white">Enter OTP</h3>
               <p className="mb-8 text-center text-sm text-gray-500">
                  We sent a 6-digit code to <br/>
                  <span className="font-semibold text-gray-900 dark:text-white">{mobileData.countryCode} {mobileData.contactNo}</span>
               </p>
               
               <div className="flex justify-center">
                  <div className="flex gap-3 [&_input]:h-14 [&_input]:w-14 [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-200 [&_input]:bg-gray-50 [&_input]:text-center [&_input]:text-xl [&_input]:font-bold [&_input]:text-gray-900 [&_input]:outline-none [&_input]:transition-all [&_input]:focus:border-[#FF6B35] [&_input]:focus:bg-white [&_input]:focus:ring-2 [&_input]:focus:ring-[#FF6B35]/20 [&_input]:dark:border-gray-700 [&_input]:dark:bg-gray-800 [&_input]:dark:text-white">
                    <OTPInput value={otp} onChange={setOtp} error={errors.otp} />
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={handleVerifyOTP}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 active:scale-[0.99]"
                >
                    Verify Code
                </button>
                <button
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowLeft size={16} /> Change Mobile Number
                </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* New Password */}
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">New Password</label>
               <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(s => ({ ...s, newPassword: e.target.value }))}
                    placeholder="Min 8 characters"
                    className={inputClasses}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
               
               {/* Strength Meter */}
               <div className="mt-2">
                   <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                       <span className="text-gray-400">Strength</span>
                       <span className={`${strengthInfo.color.replace('bg-', 'text-')}`}>{strengthInfo.label}</span>
                   </div>
                   <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength > 0 ? strengthInfo.color : 'bg-transparent'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength > 25 ? strengthInfo.color : 'bg-transparent'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength > 50 ? strengthInfo.color : 'bg-transparent'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength > 75 ? strengthInfo.color : 'bg-transparent'}`}></div>
                   </div>
                   <p className="mt-1.5 text-[11px] text-gray-400">
                       Must be at least 8 chars. Include number & symbol for strong password.
                   </p>
               </div>

               {errors.newPassword && <p className="text-xs font-medium text-red-500">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Confirm Password</label>
               <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(s => ({ ...s, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    className={inputClasses}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                     {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
               {errors.confirmPassword && <p className="text-xs font-medium text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-4 pt-2">
                <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
                </button>
                
                {/* Cancel Button in Final Step */}
                <div className="text-center">
                    <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        Cancel
                    </Link>
                </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}