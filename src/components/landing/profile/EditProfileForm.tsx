"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Clock,
  Home,
  Globe,
  ChevronDown,
  Upload,
  MapPin,
  X,
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
    birthDate: profile.birthDate
      ? new Date(profile.birthDate).toISOString().split("T")[0]
      : "",
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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage(null);
  };

  const handleLocationChange = (
    field: "birthPlace" | "city",
    locationResult: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: locationResult.place,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
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
        setMessage({ type: "success", text: "Profile photo updated successfully!" });
        onUpdate();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update avatar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload image" });
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
        setMessage({ type: "success", text: "Profile updated successfully!" });
        onUpdate();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Toast Message - Fixed positioning */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50"
          >
            <div
              className={`flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm border ${
                message.type === "success"
                  ? "bg-emerald-50/95 dark:bg-emerald-950/95 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50/95 dark:bg-red-950/95 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium flex-1">{message.text}</p>
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Photo Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-50/50 dark:from-[#111] dark:to-[#0A0A0A] rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative h-28 w-28 rounded-full p-1 bg-gradient-to-br from-[#FF6B35] via-[#FFB347] to-[#FF6B35] cursor-pointer group transition-transform hover:scale-105"
            >
              <div className="h-full w-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-[#111] relative">
                <Image
                  src={avatar(profileImage)}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
                <div
                  className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                    uploadingImage
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {uploadingImage ? (
                    <Loader2 className="h-7 w-7 animate-spin text-white" />
                  ) : (
                    <Camera className="h-7 w-7 text-white" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] text-white border-4 border-white dark:border-[#111] shadow-lg group-hover:scale-110 transition-transform">
                <Upload className="h-4 w-4" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload profile picture"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Profile Photo
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Click to upload a new profile picture (Max 5MB)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-[#FF6B35] hover:text-[#E55A2B] transition-colors inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Change Photo
            </button>
          </div>
        </div>
      </motion.div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
          <div className="p-2 rounded-lg bg-[#FF6B35]/10">
            <User className="h-5 w-5 text-[#FF6B35]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
            >
              Full Name *
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label
              htmlFor="gender"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
            >
              Gender
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Birth Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
          <div className="p-2 rounded-lg bg-[#FF6B35]/10">
            <Calendar className="h-5 w-5 text-[#FF6B35]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Birth Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Birth Date */}
          <div className="space-y-2">
            <label
              htmlFor="birthDate"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
            >
              Date of Birth
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
              <input
                id="birthDate"
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Birth Time */}
          <div className="space-y-2">
            <label
              htmlFor="birthTime"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
            >
              Time of Birth
            </label>
            <div className="relative group">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
              <input
                id="birthTime"
                type="time"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Birth Place */}
          <div className="space-y-2">
            <label
              htmlFor="birthPlace"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
            >
              Place of Birth
            </label>
            <div className="relative group">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
              <div className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus-within:bg-white dark:focus-within:bg-black focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 transition-all">
                <LocationInput
                  value={formData.birthPlace}
                  onChange={(res: any) => handleLocationChange("birthPlace", res)}
                  placeholder="Search birth city..."
                  name="birthPlace"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact & Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
          <div className="p-2 rounded-lg bg-[#FF6B35]/10">
            <Globe className="h-5 w-5 text-[#FF6B35]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Contact & Address
          </h3>
        </div>

        <div className="space-y-5">
          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
                <div className="flex gap-2 pl-11">
                  <div className="relative w-24 flex-shrink-0 -ml-11">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-full h-full pl-11 pr-8 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all appearance-none"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Line */}
          <div className="space-y-2">
            <label
              htmlFor="addressLine1"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
            >
              Street Address
            </label>
            <div className="relative group">
              <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
              <input
                id="addressLine1"
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                placeholder="123 Main Street"
              />
            </div>
          </div>

          {/* City & Pincode Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* City */}
            <div className="space-y-2">
              <label
                htmlFor="city"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
              >
                City
              </label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
                <div className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus-within:bg-white dark:focus-within:bg-black focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 transition-all">
                  <LocationInput
                    value={formData.city}
                    onChange={(res: any) => handleLocationChange("city", res)}
                    placeholder="Search city..."
                    name="city"
                  />
                </div>
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <label
                htmlFor="pincode"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
              >
                Pincode
              </label>
              <div className="relative group">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors pointer-events-none z-10" />
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 outline-none transition-all"
                  placeholder="400001"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 justify-end pt-2"
      >
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all active:scale-[0.98] shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] hover:from-[#E55A2B] hover:to-[#FF6B35] text-white font-bold shadow-lg hover:shadow-xl hover:shadow-[#FF6B35]/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 min-w-[140px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </motion.div>
    </form>
  );
}