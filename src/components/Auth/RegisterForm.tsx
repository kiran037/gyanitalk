"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Calendar, User, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import PhoneInput from "@/components/adminUI/PhoneInput";
import OTPInput from "@/components/Auth/OTPInput";

type Step = 1 | 2 | 3;

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Minimal Data
  const [formData, setFormData] = useState({
    name: "", 
    contactNo: "", 
    countryCode: "+91", 
    otp: "",
    birthDate: "", 
    gender: "", 
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const redirectAfterRegister = async () => {
    try {
      const res = await fetch("/api/me");
      const { data } = await res.json();
      const roleIds = data.roles.map((r: any) => parseInt(r.id));
      if (roleIds.includes(2) || roleIds.includes(3)) router.push("/");
      else router.push("/admin/dashboard");
    } catch { router.push("/"); }
  };

  // --- Step 1: Send OTP ---
  const handleSendOTP = async () => {
    setErrors({});
    if (!formData.contactNo) return setErrors({ contactNo: "Mobile number required" });
    const cleanNumber = formData.contactNo.replace(/\D/g, "").slice(-10);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactNo: cleanNumber, countryCode: formData.countryCode }),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("OTP sent!");
      setStep(2);
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  // --- Step 2: Validate OTP Input (Visual only) ---
  const handleNextToDetails = () => {
    setErrors({});
    if (!formData.otp || formData.otp.length !== 6) return setErrors({ otp: "Invalid OTP" });
    setStep(3);
  };

  // --- Step 3: Final Registration ---
  const handleFinalSubmit = async () => {
    setErrors({});
    if (!formData.name.trim()) return setErrors({ name: "Name is required" });
    if (!formData.birthDate) return setErrors({ birthDate: "Birth Date required" });
    if (!formData.gender) return setErrors({ gender: "Gender is required" });

    const cleanNumber = formData.contactNo.replace(/\D/g, "").slice(-10);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactNo: cleanNumber,
          countryCode: formData.countryCode,
          otp: formData.otp,
          name: formData.name,
          birthDate: formData.birthDate,
          gender: formData.gender,
          birthTime: "00:00", 
          birthPlace: null, 
          email: null,
          profile: null,
        }),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("Welcome aboard!");
      await redirectAfterRegister();
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  // Unified Input Styles (Matches Login Form exactly)
  const inputClasses = "w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#FF6B35]/50 focus:bg-white focus:ring-4 focus:ring-[#FF6B35]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-[#FF6B35]";

  return (
    <div className="w-full">
      
      {/* Stepper (Subtle Progress Bar) */}
      <div className="mb-10">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            <span className={step >= 1 ? "text-[#FF6B35]" : ""}>Mobile</span>
            <span className={step >= 2 ? "text-[#FF6B35]" : ""}>Verify</span>
            <span className={step >= 3 ? "text-[#FF6B35]" : ""}>Details</span>
        </div>
        <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <motion.div 
                className="h-full rounded-full bg-[#FF6B35]" 
                initial={{ width: "33%" }}
                animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                transition={{ duration: 0.3 }}
            />
        </div>
      </div>

      {errors.form && (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600 dark:bg-red-900/10 dark:text-red-400"
        >
            {errors.form}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        
        {/* --- STEP 1: MOBILE --- */}
        {step === 1 && (
          <motion.div 
            key="step1" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }} 
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
             <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mobile Number
                 </label>
                 <PhoneInput
                    value={formData.contactNo}
                    countryCode={formData.countryCode}
                    onChange={(p, c) => setFormData(s => ({...s, contactNo: p, countryCode: c}))}
                    error={errors.contactNo}
                 />
                 <p className="text-xs text-gray-400">We'll send you a 6-digit verification code.</p>
             </div>
             
             <button
                onClick={handleSendOTP}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-70"
             >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Get OTP Code"}
                {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
             </button>
          </motion.div>
        )}

        {/* --- STEP 2: OTP --- */}
        {step === 2 && (
          <motion.div 
            key="step2" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
             <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verify Number</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Code sent to <span className="font-semibold text-gray-900 dark:text-gray-200">{formData.contactNo}</span>
                </p>
             </div>

             <div className="flex justify-center">
                <div className="gap-3 [&_input]:h-14 [&_input]:w-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-200 [&_input]:bg-gray-50 [&_input]:text-center [&_input]:text-xl [&_input]:font-bold [&_input]:text-gray-900 [&_input]:outline-none [&_input]:transition-all [&_input]:focus:border-[#FF6B35] [&_input]:focus:bg-white [&_input]:focus:ring-2 [&_input]:focus:ring-[#FF6B35]/20 [&_input]:dark:border-gray-700 [&_input]:dark:bg-gray-800 [&_input]:dark:text-white [&_input]:sm:w-14">
                    <OTPInput value={formData.otp} onChange={(val) => setFormData(s => ({...s, otp: val}))} error={errors.otp} />
                </div>
             </div>

             <div className="space-y-4">
                <button 
                    onClick={handleNextToDetails} 
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 active:scale-[0.99]"
                >
                    Verify & Continue
                </button>
                <div className="text-center">
                    <button onClick={() => setStep(1)} className="text-sm font-medium text-gray-500 hover:text-[#FF6B35] dark:hover:text-gray-300">
                        ← Change Mobile Number
                    </button>
                </div>
             </div>
          </motion.div>
        )}

        {/* --- STEP 3: DETAILS --- */}
        {step === 3 && (
          <motion.div 
            key="step3" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
             {/* Name */}
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Full Name</label>
                <div className="relative">
                    <User className="absolute left-5 top-4 h-5 w-5 text-gray-400" />
                    <input
                        value={formData.name}
                        onChange={e => setFormData(s => ({...s, name: e.target.value}))}
                        className={`${inputClasses} pl-12`}
                        placeholder="e.g. Rahul Kumar"
                    />
                </div>
                {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
             </div>

             {/* Date of Birth */}
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date of Birth</label>
                <div className="relative">
                   <Calendar className="absolute left-5 top-4 h-5 w-5 text-gray-400" />
                   <input
                     type="date"
                     value={formData.birthDate}
                     max={new Date().toISOString().split("T")[0]}
                     onChange={e => setFormData(s => ({...s, birthDate: e.target.value}))}
                     className={`${inputClasses} pl-12`}
                   />
                </div>
                {errors.birthDate && <p className="text-xs font-medium text-red-500">{errors.birthDate}</p>}
             </div>

             {/* Gender */}
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Gender</label>
                <div className="flex gap-3">
                   {["Male", "Female", "Other"].map((g) => (
                     <button
                       key={g}
                       type="button"
                       onClick={() => setFormData(s => ({...s, gender: g}))}
                       className={`flex-1 rounded-xl border py-4 text-sm font-bold transition-all ${
                         formData.gender === g 
                           ? "border-[#FF6B35] bg-orange-50 text-[#FF6B35] ring-1 ring-[#FF6B35] dark:bg-orange-900/20" 
                           : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                       }`}
                     >
                       {g}
                     </button>
                   ))}
                </div>
                {errors.gender && <p className="text-xs font-medium text-red-500">{errors.gender}</p>}
             </div>

             <div className="pt-2">
                <button 
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] py-4 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Free Account"}
                </button>
             </div>
             
             <div className="text-center">
                 <button onClick={() => setStep(2)} className="text-sm font-medium text-gray-500 hover:text-[#FF6B35]">
                     ← Back to OTP
                 </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Link */}
      {step === 1 && (
        <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#FF6B35] hover:underline">
                    Log In
                </Link>
            </p>
        </div>
      )}
    </div>
  );
}