"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Calendar, User } from "lucide-react";
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

    // Clean number (send only last 10 digits)
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
    
    // Validation
    if (!formData.name.trim()) return setErrors({ name: "Name is required" });
    if (!formData.birthDate) return setErrors({ birthDate: "Birth Date required" });
    if (!formData.gender) return setErrors({ gender: "Gender is required" });

    // Clean number again for safety
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

  return (
    <div className="w-full">
      
      {/* Stepper Dots (Minimal & Centered) */}
      <div className="mb-10 flex justify-center gap-2.5">
        {[1, 2, 3].map((s) => (
            <div 
                key={s} 
                className={`h-2 rounded-full transition-all duration-300 ${
                    s === step ? "w-8 bg-[#FF6B35]" : 
                    s < step ? "w-2 bg-green-500" : "w-2 bg-gray-200 dark:bg-gray-700"
                }`} 
            />
        ))}
      </div>

      {errors.form && <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{errors.form}</div>}

      <AnimatePresence mode="wait">
        
        {/* --- STEP 1: MOBILE --- */}
        {step === 1 && (
          <motion.div 
            key="step1" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="space-y-8"
          >
             <div className="space-y-2">
                 <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Mobile Number
                 </label>
                 <PhoneInput
                    value={formData.contactNo}
                    countryCode={formData.countryCode}
                    onChange={(p, c) => setFormData(s => ({...s, contactNo: p, countryCode: c}))}
                    error={errors.contactNo}
                 />
                 <p className="text-xs text-gray-500">We'll send you a 6-digit verification code.</p>
             </div>
             
             <button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-4 text-base font-bold text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black dark:shadow-none"
             >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Get OTP Code"}
             </button>
          </motion.div>
        )}

        {/* --- STEP 2: OTP --- */}
        {step === 2 && (
          <motion.div 
            key="step2" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="space-y-8"
          >
             <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter Code</h3>
                <p className="mt-2 text-sm text-gray-500">
                    We sent a code to <span className="font-semibold text-gray-900 dark:text-gray-200">{formData.contactNo}</span>
                </p>
             </div>

             <div className="flex justify-center">
                <div className="gap-2 [&_input]:h-14 [&_input]:w-12 [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-200 [&_input]:bg-gray-50 [&_input]:text-center [&_input]:text-xl [&_input]:font-bold [&_input]:text-gray-900 [&_input]:outline-none [&_input]:transition-all [&_input]:focus:border-gray-900 [&_input]:focus:bg-white [&_input]:focus:ring-0 [&_input]:dark:border-gray-700 [&_input]:dark:bg-gray-800 [&_input]:dark:text-white [&_input]:sm:w-14">
                    <OTPInput value={formData.otp} onChange={(val) => setFormData(s => ({...s, otp: val}))} error={errors.otp} />
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <button 
                    onClick={handleNextToDetails} 
                    className="w-full rounded-xl bg-[#0F172A] py-4 text-base font-bold text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99] dark:bg-white dark:text-black dark:shadow-none"
                >
                    Verify & Continue
                </button>
                <button onClick={() => setStep(1)} className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
                    Change Mobile Number
                </button>
             </div>
          </motion.div>
        )}

        {/* --- STEP 3: DETAILS --- */}
        {step === 3 && (
          <motion.div 
            key="step3" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-6"
          >
             <div className="text-center">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">Almost Done</h3>
                 <p className="mt-1 text-sm text-gray-500">Please fill in your basic details</p>
             </div>

             {/* Name */}
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Name</label>
                <div className="relative">
                    <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                        value={formData.name}
                        onChange={e => setFormData(s => ({...s, name: e.target.value}))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-gray-800"
                        placeholder="e.g. Rahul Kumar"
                    />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
             </div>

             {/* Date of Birth */}
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date of Birth</label>
                <div className="relative">
                   <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                   <input
                     type="date"
                     value={formData.birthDate}
                     max={new Date().toISOString().split("T")[0]}
                     onChange={e => setFormData(s => ({...s, birthDate: e.target.value}))}
                     className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-gray-800"
                   />
                </div>
                {errors.birthDate && <p className="text-xs text-red-500">{errors.birthDate}</p>}
             </div>

             {/* Gender */}
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gender</label>
                <div className="flex gap-3">
                   {["Male", "Female", "Other"].map((g) => (
                     <button
                       key={g}
                       type="button"
                       onClick={() => setFormData(s => ({...s, gender: g}))}
                       className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-all ${
                         formData.gender === g 
                           ? "border-[#FF6B35] bg-orange-50 text-[#FF6B35] ring-2 ring-[#FF6B35]/20 dark:bg-orange-900/20" 
                           : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                       }`}
                     >
                       {g}
                     </button>
                   ))}
                </div>
                {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
             </div>

             <div className="pt-4">
                <button 
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-4 text-base font-bold text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black dark:shadow-none"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}