

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  ArrowLeft, ArrowRight, Camera, Check, 
  Loader2, Mail, User, Calendar, Clock 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import PhoneInput from "@/components/adminUI/PhoneInput";
import OTPInput from "@/components/Auth/OTPInput";
import LocationInput from "@/components/landing/kundali/LocationInput";
import { uploadImage } from "@/upload";

type Step = 1 | 2 | 3;

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Data
  const [formData, setFormData] = useState({
    name: "", 
    contactNo: "", 
    countryCode: "+91", 
    location: "", // Stores the string name of the place
    birthDate: "", 
    birthTime: "", 
    email: "", 
    profile: "",
    gender: "", // ✅ Added Gender
  });
  
  // We keep locationData if we need lat/long later, but for user table we just need the string
  const [locationData, setLocationData] = useState<any>(null);
  
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [otp, setOtp] = useState("");
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

  // Step 1: Send OTP
  const handleStep1Submit = async () => {
    setErrors({});
    
    // Validation
    if (!formData.name.trim()) return setErrors({ name: "Name is required" });
    if (!formData.contactNo) return setErrors({ contactNo: "Mobile number required" });
    if (!formData.birthDate) return setErrors({ birthDate: "Birth Date required" });
    if (!formData.location) return setErrors({ location: "Birth Place required" });
    if (!formData.gender) return setErrors({ gender: "Gender is required" }); // ✅ Validate Gender

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactNo: formData.contactNo, countryCode: formData.countryCode }),
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("Verification code sent!");
      setStep(2);
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  // Step 2: Verify & Register
  const handleStep2Submit = async () => {
    setErrors({});
    if (!otp || otp.length !== 6) return setErrors({ otp: "Invalid OTP" });

    setLoading(true);
    try {
      let profilePath = "";
      if (profileFile) {
        const uploadResult = await uploadImage(profileFile, "users");
        profilePath = uploadResult.path;
      }

      // ✅ Sending all data correctly to backend
      const res = await fetch("/api/auth/verify-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactNo: formData.contactNo,
          countryCode: formData.countryCode,
          otp,
          name: formData.name,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime || "00:00",
          birthPlace: formData.location, // ✅ Sending Location String
          gender: formData.gender,       // ✅ Sending Gender
          email: formData.email || null,
          profile: profilePath || null,
        }),
      });

      if (!res.ok) { const r = await res.json(); throw new Error(r.error); }
      toast.success("Account Created!");
      if (formData.email) setStep(3);
      else await redirectAfterRegister();
    } catch (e: any) { toast.error(e.message); setErrors({ form: e.message }); }
    finally { setLoading(false); }
  };

  const handleSendVerificationEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-verification-email", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Email sent!");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed");
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="mb-8 flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
             <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                s === step ? "bg-[#FF6B35] text-white" : 
                s < step ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800"
             }`}>
                {s < step ? <Check size={14} /> : s}
             </div>
             {s < 3 && <div className={`h-1 w-8 rounded-full ${s < step ? "bg-green-500" : "bg-gray-100 dark:bg-gray-800"}`} />}
          </div>
        ))}
        <span className="ml-auto text-sm font-medium text-gray-500">Step {step} of 3</span>
      </div>

      {errors.form && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{errors.form}</div>}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
             <div className="grid gap-6 md:grid-cols-2">
                
                {/* Photo Upload */}
                <div className="flex flex-col items-center justify-center md:col-span-2">
                   <div className="relative group cursor-pointer">
                      <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                         {profilePreview ? (
                           <img src={profilePreview} alt="Preview" className="h-full w-full object-cover" />
                         ) : (
                           <div className="flex h-full w-full items-center justify-center text-gray-400"><User size={32} /></div>
                         )}
                      </div>
                      <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-md hover:bg-[#e05825]">
                         <Camera size={14} />
                         <input type="file" accept="image/*" className="hidden" onChange={handleProfileChange} />
                      </label>
                   </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                   <input
                      value={formData.name}
                      onChange={e => setFormData(s => ({...s, name: e.target.value}))}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-gray-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="e.g. Rahul Kumar"
                   />
                   {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Mobile */}
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                   <PhoneInput
                      value={formData.contactNo}
                      countryCode={formData.countryCode}
                      onChange={(p, c) => setFormData(s => ({...s, contactNo: p, countryCode: c}))}
                      error={errors.contactNo}
                   />
                </div>

                {/* Gender (Added this UI) */}
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                   <div className="flex gap-4">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData(s => ({...s, gender: g}))}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                            formData.gender === g 
                              ? "border-[#FF6B35] bg-orange-50 text-[#FF6B35] dark:bg-orange-900/20" 
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                   </div>
                   {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                </div>

                {/* Birth Date */}
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                   <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.birthDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={e => setFormData(s => ({...s, birthDate: e.target.value}))}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                   </div>
                   {errors.birthDate && <p className="text-xs text-red-500">{errors.birthDate}</p>}
                </div>

                {/* Birth Time */}
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time (Optional)</label>
                   <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={formData.birthTime}
                        onChange={e => setFormData(s => ({...s, birthTime: e.target.value}))}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                   </div>
                </div>

                {/* Location Input */}
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Birth Place</label>
                   <LocationInput
                      value={formData.location}
                      onChange={(loc) => { 
                        setLocationData(loc); 
                        setFormData(s => ({...s, location: loc.place})); // ✅ Stores string
                      }}
                      placeholder="Search city..."
                      error={errors.location}
                   />
                </div>

                {/* Email */}
                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(s => ({...s, email: e.target.value}))}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="you@example.com"
                      />
                   </div>
                </div>
             </div>

             <div className="pt-4">
                <button
                  onClick={handleStep1Submit}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-4 text-sm font-bold text-white transition-transform hover:bg-black active:scale-[0.99] disabled:opacity-70 dark:bg-white dark:text-black"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Next Step <ArrowRight size={18} /></>}
                </button>
             </div>
          </motion.div>
        )}

        {/* Step 2 & 3 (Same as before but shortened here for brevity, keep your existing logic for these) */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pt-4">
             <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verify Mobile</h3>
                <p className="mt-2 text-sm text-gray-500">Enter code sent to <br/><span className="font-semibold">{formData.countryCode} {formData.contactNo}</span></p>
             </div>
             <div className="flex justify-center py-4"><OTPInput value={otp} onChange={setOtp} error={errors.otp} /></div>
             <button onClick={() => setStep(1)} className="mx-auto block text-sm font-semibold text-[#FF6B35] hover:underline">Change Number</button>
             <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold hover:bg-gray-50"><ArrowLeft size={16} /> Back</button>
                <button onClick={handleStep2Submit} disabled={loading} className="flex-[2] rounded-xl bg-[#0F172A] py-3.5 text-sm font-bold text-white hover:bg-black disabled:opacity-70">{loading ? <Loader2 className="mx-auto animate-spin" size={20} /> : "Verify & Register"}</button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 py-8 text-center">
             <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100"><Check className="h-10 w-10 text-green-600" /></div>
             <div><h3 className="text-2xl font-bold text-gray-900">Welcome aboard!</h3></div>
             <div className="rounded-xl bg-orange-50 p-6"><p className="text-sm font-medium text-gray-800">Verify your email?</p><p className="mt-1 text-xs text-gray-500">Link sent to <strong>{formData.email}</strong></p><button onClick={handleSendVerificationEmail} disabled={loading} className="mt-4 w-full rounded-lg bg-[#FF6B35] py-2.5 text-sm font-semibold text-white hover:bg-[#e05825]">{loading ? "Sending..." : "Send Verification Link"}</button></div>
             <button onClick={() => redirectAfterRegister()} className="text-sm font-semibold text-gray-500 hover:text-gray-900">Skip to Dashboard</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}