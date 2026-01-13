"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Calendar, Loader2, CheckCircle2, AlertCircle,
  Camera, Clock, Home, ChevronDown, Upload, Globe
} from "lucide-react";
import { avatar } from "@/lib/images";
import { uploadImage } from "@/upload";
import Image from "next/image";
import LocationInput from "@/components/landing/kundali/LocationInput";

interface EditProfileFormProps {
  profile: any;
  onUpdate: () => void;
}

export default function EditProfileForm({ profile, onUpdate }: EditProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    email: profile.email || "",
    contactNo: profile.contactNo || "",
    countryCode: profile.countryCode || "+91",
    birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split("T")[0] : "",
    birthTime: profile.birthTime || "",
    birthPlace: profile.birthPlace || "",
    gender: profile.gender || "",
    addressLine1: profile.addressLine1 || "",
    addressLine2: profile.addressLine2 || "",
    city: profile.location || "",
    pincode: profile.pincode || "",
  });

  const [profileImage, setProfileImage] = useState(profile.profile);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage(null);
  };

  const handleLocationChange = (field: "birthPlace" | "city", locationResult: any) => {
    setFormData((prev) => ({ ...prev, [field]: locationResult.place }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Invalid file type" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Max size 5MB" });
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadImage(file, "storage/profiles");
      const res = await fetch("/api/landing/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePath: result.path }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfileImage(result.path);
        setMessage({ type: "success", text: "Photo updated!" });
        onUpdate();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Upload failed" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/landing/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Saved successfully!" });
        onUpdate();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error saving profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 pb-24 lg:pb-0 px-4 sm:px-0">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 z-50 w-[90%] max-w-sm pointer-events-none"
          >
            <div className={`pointer-events-auto flex items-center gap-2.5 p-3 rounded-xl shadow-lg backdrop-blur-md border ${
              message.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-400/50"
                : "bg-red-500/90 text-white border-red-400/50"
            }`}>
              {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <p className="text-xs font-semibold flex-1">{message.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Avatar Card - Compact */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-row items-center gap-4">
        <div className="relative group shrink-0">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] cursor-pointer"
          >
            <div className="w-full h-full rounded-full border-2 border-white dark:border-[#1C1C1E] overflow-hidden relative bg-gray-100">
               <Image
                  src={avatar(profileImage)}
                  alt="Profile"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized={true}
                />
               <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${uploadingImage ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                 {uploadingImage ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
               </div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>
        <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{formData.name || "User"}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Update your photo</p>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-[#FF6B35] bg-[#FF6B35]/10 px-3 py-1.5 rounded-lg active:bg-[#FF6B35]/20 transition-colors"
            >
                Change Photo
            </button>
        </div>
      </div>

      {/* 2. Personal Information */}
      <FormSection title="Personal Info">
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
           <InputField 
             label="Full Name" 
             name="name" 
             value={formData.name} 
             onChange={handleChange} 
             icon={User} 
             placeholder="Name" 
           />
           <SelectField 
             label="Gender" 
             name="gender" 
             value={formData.gender} 
             onChange={handleChange} 
             icon={User}
           >
             <option value="">Select Gender</option>
             <option value="Male">Male</option>
             <option value="Female">Female</option>
             <option value="Other">Other</option>
           </SelectField>
        </div>
      </FormSection>

      {/* 3. Birth Details - Compact Grid */}
      <FormSection title="Birth Details">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
           <InputField 
             label="Birth Date" 
             name="birthDate" 
             type="date"
             value={formData.birthDate} 
             onChange={handleChange} 
             icon={Calendar}
             className="col-span-1"
           />
           <InputField 
             label="Birth Time" 
             name="birthTime" 
             type="time"
             value={formData.birthTime} 
             onChange={handleChange} 
             icon={Clock} 
             className="col-span-1"
           />
           <div className="col-span-2 md:col-span-1 space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider ml-1">
                Place of Birth
              </label>
              <div className="relative group">
                <div className="location-input-wrapper">
                    <LocationInput
                        value={formData.birthPlace}
                        onChange={(res: any) => handleLocationChange("birthPlace", res)}
                        placeholder="City"
                        name="birthPlace"
                    />
                </div>
              </div>
           </div>
        </div>
      </FormSection>

      {/* 4. Contact & Address */}
      <FormSection title="Contact Info">
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField 
                    label="Email" 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    icon={Mail} 
                    placeholder="Email"
                />
                
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider ml-1">
                        Phone
                    </label>
                    <div className="flex gap-2">
                        <div className="relative w-[4.5rem] shrink-0">
                            <select
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={handleChange}
                            className="w-full h-10 pl-2 pr-6 rounded-xl bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 text-xs font-medium focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none appearance-none transition-all text-gray-900 dark:text-white"
                            >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                        </div>
                        <input
                            type="tel"
                            name="contactNo"
                            value={formData.contactNo}
                            onChange={handleChange}
                            placeholder="Mobile"
                            className="flex-1 h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 text-sm font-medium focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>
                </div>
           </div>

           <InputField 
             label="Address" 
             name="addressLine1" 
             value={formData.addressLine1} 
             onChange={handleChange} 
             icon={Home} 
             placeholder="House / Street"
           />
           
           <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider ml-1">
                    City
                </label>
                <div className="relative group">
                    <div className="location-input-wrapper">
                        <LocationInput
                            value={formData.city}
                            onChange={(res: any) => handleLocationChange("city", res)}
                            placeholder="City"
                            name="city"
                        />
                    </div>
                </div>
              </div>
              <InputField 
                label="Pincode" 
                name="pincode" 
                value={formData.pincode} 
                onChange={handleChange} 
                icon={Globe} 
                placeholder="Zip Code"
              />
           </div>
        </div>
      </FormSection>

      {/* Action Bar - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 lg:static lg:bg-transparent lg:border-none lg:p-0 z-40 safe-area-pb">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 lg:flex-none lg:px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 transition-colors"
            >
            Cancel
            </button>
            <button
            type="submit"
            disabled={loading}
            className="flex-[2] lg:flex-none lg:px-8 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#e55a2b] text-white text-sm font-bold shadow-lg shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {loading ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>
      
      {/* Location Input Global Override */}
      <style jsx global>{`
        .location-input-wrapper input {
            width: 100%;
            height: 2.5rem; /* h-10 (40px) */
            padding-left: 1rem; /* Adjusted since icon is removed */
            padding-right: 0.75rem;
            border-radius: 0.75rem; /* rounded-xl */
            background-color: var(--input-bg);
            border: 1px solid var(--input-border);
            color: var(--input-text);
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
        }
        .dark .location-input-wrapper input {
            --input-bg: #0A0A0A;
            --input-border: rgba(255,255,255,0.1);
            --input-text: white;
        }
        .light .location-input-wrapper input, .location-input-wrapper input {
            --input-bg: #F9FAFB;
            --input-border: #E5E7EB;
            --input-text: #111827;
        }
        .location-input-wrapper input:focus {
            border-color: #FF6B35;
            box-shadow: 0 0 0 1px #FF6B35;
        }
        .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </form>
  );
}

// ==========================================
// Compact Sub Components
// ==========================================

function FormSection({ title, children }: any) {
    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 opacity-80">{title}</h3>
            {children}
        </div>
    );
}

function InputField({ label, icon: Icon, className, ...props }: any) {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider ml-1">
                {label}
            </label>
            <div className="relative group">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
                <input
                    {...props}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-transparent focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none transition-all dark:[color-scheme:dark]"
                />
            </div>
        </div>
    );
}

function SelectField({ label, icon: Icon, children, ...props }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider ml-1">
                {label}
            </label>
            <div className="relative group">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
                <select
                    {...props}
                    className="w-full h-10 pl-9 pr-8 rounded-xl bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-transparent focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none appearance-none cursor-pointer transition-all"
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
}