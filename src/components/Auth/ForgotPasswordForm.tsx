"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "@/components/adminUI/PhoneInput";
import OTPInput from "@/components/Auth/OTPInput";

type Step = 1 | 2 | 3;
type Method = "mobile" | "email";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<Method>("mobile");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Data
  const [mobileData, setMobileData] = useState({ contactNo: "", countryCode: "+91" });
  const [emailData, setEmailData] = useState({ email: "" });
  const [otp, setOtp] = useState("");
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Handlers ---

  const handleSendOTP = async () => {
    setErrors({});
    if (method === "mobile" && !mobileData.contactNo) return setErrors({ contactNo: "Mobile number required" });
    if (method === "email" && !emailData.email) return setErrors({ email: "Email required" });

    setLoading(true);
    try {
      const payload = method === "mobile" 
        ? { contactNo: mobileData.contactNo, countryCode: mobileData.countryCode }
        : { email: emailData.email };
      
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("OTP sent successfully!");
      setStep(2);
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = () => {
    setErrors({});
    if (!otp || otp.length !== 6) return setErrors({ otp: "Enter valid 6-digit OTP" });
    // In a real app, you might verify OTP with server here before moving to step 3
    setStep(3);
  };

  const handleResetPassword = async () => {
    setErrors({});
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) return setErrors({ newPassword: "Min 6 characters required" });
    if (passwordData.newPassword !== passwordData.confirmPassword) return setErrors({ confirmPassword: "Passwords do not match" });

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactNo: method === "mobile" ? mobileData.contactNo : undefined,
          countryCode: method === "mobile" ? mobileData.countryCode : undefined,
          email: method === "email" ? emailData.email : undefined,
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

  return (
    <div>
      {/* Error Banner */}
      {errors.form && (
        <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
          {errors.form}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Choose Method & Input */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Toggle Switch */}
            <div className="mb-8 flex gap-6 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setMethod("mobile")}
                className={`pb-3 text-sm font-semibold transition-all ${
                  method === "mobile" 
                    ? "border-b-2 border-[#FF6B35] text-gray-900 dark:text-white" 
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
                }`}
              >
                Mobile Number
              </button>
              <button
                onClick={() => setMethod("email")}
                className={`pb-3 text-sm font-semibold transition-all ${
                  method === "email" 
                    ? "border-b-2 border-[#FF6B35] text-gray-900 dark:text-white" 
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
                }`}
              >
                Email Address
              </button>
            </div>

            <div className="space-y-6">
              {method === "mobile" ? (
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                   <PhoneInput
                      value={mobileData.contactNo}
                      countryCode={mobileData.countryCode}
                      onChange={(p, c) => setMobileData({ contactNo: p, countryCode: c })}
                      error={errors.contactNo}
                    />
                </div>
              ) : (
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                   <input
                      type="email"
                      value={emailData.email}
                      onChange={(e) => setEmailData({ email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                   />
                   {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Verification Code"}
              </button>
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
            className="space-y-6"
          >
            <div>
               <div className="mb-4 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter OTP</label>
                  <button 
                     type="button" 
                     onClick={() => setStep(1)} 
                     className="text-xs font-semibold text-[#FF6B35] hover:underline"
                  >
                     Change details
                  </button>
               </div>
               <p className="mb-6 text-sm text-gray-500">
                  We sent a code to <span className="font-medium text-gray-900 dark:text-white">{method === "mobile" ? `${mobileData.countryCode} ${mobileData.contactNo}` : emailData.email}</span>
               </p>
               <div className="flex justify-center">
                  <OTPInput value={otp} onChange={setOtp} error={errors.otp} />
               </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    onClick={() => setStep(1)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    onClick={handleVerifyOTP}
                    className="flex-[2] rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] dark:bg-white dark:text-black"
                >
                    Verify Code
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
            className="space-y-5"
          >
            <div className="space-y-1.5">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
               <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(s => ({ ...s, newPassword: e.target.value }))}
                    placeholder="Min 6 chars"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
               {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
               <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(s => ({ ...s, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                     {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
               {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-2">
                <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-3.5 text-sm font-bold text-white transition-transform hover:bg-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Reset Password"}
                </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[#FF6B35] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}