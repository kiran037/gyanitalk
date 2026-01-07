"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/adminUI/PageHeader"; // Adjust path if needed
import { Button } from "@/components/adminUI/Button"; // Adjust path if needed
import { useToast } from "@/components/Toast/ToastProvider"; // Adjust path if needed
import {
  User, Mail, Phone, MapPin, Calendar, Save, Camera,
  Lock, Activity, Wallet, Star, Shield, Sparkles,
  Eye, EyeOff, Loader2, X, Home,
  Copy, CheckCircle2, Clock, AlertCircle, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { avatar } from "@/lib/images";

// --- Types (Matching /api/me Response) ---
interface Role {
  id: string;
  name: string;
  isActive: boolean;
}

interface UserStats {
  totalOrders: number;
  totalReviews: number;
  totalTickets: number;
}

interface UserData {
  id: string;
  name: string;
  email: string | null;
  contactNo: string | null;
  countryCode: string | null;
  profile: string | null;
  
  // Details
  gender: string | null;
  birthDate: string | null;
  birthTime: string | null;
  birthPlace: string | null;
  location: string | null;
  addressLine1: string | null;
  
  // System
  isActive: boolean;
  createdAt: string;
  loginAt: string | null;
  
  // Roles & Flags
  roles: Role[];
  isAstrologer: boolean;
  isAdmin: boolean;
  
  // Financials
  walletBalance: string;
  
  // Aggregated Stats
  stats: UserStats;
}

export default function AdminProfilePage() {
  const addToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- Global State ---
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  
  // --- Action States ---
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- Form States ---
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    location: "",
    addressLine1: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // --- Initial Load ---
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { 
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' }
      });
      const json = await res.json();

      if (json.success) {
        const u = json.data;
        setUser(u);
        // Populate form with editable fields
        setFormData({
          name: u.name || "",
          gender: u.gender || "",
          birthDate: u.birthDate ? u.birthDate.split("T")[0] : "",
          location: u.location || "",
          addressLine1: u.addressLine1 || "",
        });
      } else {
        throw new Error(json.error || "Failed to load profile");
      }
    } catch (error: any) {
      console.error("Profile load error:", error);
      addToast("error", "Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("success", "Copied", "ID copied to clipboard");
  };

  const formatTimeAgo = (dateString?: string | null) => {
    if (!dateString) return "Never";
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // --- Actions ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        addToast("success", "Updated", "Profile details saved successfully");
        setUser((prev) => prev ? ({ ...prev, ...json.data }) : null);
        setIsEditing(false);
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      addToast("error", "Error", err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "File too large", "Image must be under 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch("/api/profile/upload-image", { method: "POST", body: fd });
      const json = await res.json();

      if (json.success) {
        addToast("success", "Success", "Profile photo updated");
        // Update local state image immediately
        if (user) setUser({ ...user, profile: json.data.imageUrl });
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      addToast("error", "Error", err.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast("error", "Mismatch", "New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      const json = await res.json();

      if (json.success) {
        addToast("success", "Success", "Password changed successfully");
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      addToast("error", "Error", err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  // --- Loading Skeleton ---
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
         <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
         <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
         </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* --- Breadcrumb & Actions --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link 
              href="/admin/dashboard" 
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#FF6B35] transition-colors mb-1"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          </div>

          <div className="flex items-center gap-3">
             <Button
               variant="outline"
               icon={<Lock className="w-4 h-4" />}
               onClick={() => setShowPasswordModal(true)}
             >
               Password
             </Button>
             {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white shadow-lg shadow-orange-500/20"
                >
                  Edit Profile
                </Button>
             )}
          </div>
        </div>

        {/* --- IDENTITY CARD --- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-slate-900 to-slate-800 relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
             <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-xs text-white/90 border border-white/10">
               <Clock className="w-3.5 h-3.5" />
               Last active: {formatTimeAgo(user.loginAt)}
             </div>
          </div>

          <div className="px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="-mt-12 sm:-mt-16 flex-shrink-0 relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 shadow-md overflow-hidden relative">
                    <img src={avatar(user.profile)} alt={user.name} className="w-full h-full object-cover" />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 p-2 bg-[#FF6B35] text-white rounded-full shadow-lg hover:bg-[#e55a2b] hover:scale-110 transition-all"
                  title="Upload new photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              {/* Identity Info */}
              <div className="pt-2 sm:pt-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {user.name}
                      {user.isActive && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => copyToClipboard(user.id)}>
                        <span className="font-mono text-xs">ID: {user.id}</span>
                        <Copy className="w-3 h-3" />
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map(role => (
                      <span key={role.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                         <Shield className="w-3 h-3" /> {role.name}
                      </span>
                    ))}
                    {user.isAstrologer && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30">
                         <Sparkles className="w-3 h-3" /> Astrologer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: Editable Form & Stats --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Form */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#FF6B35]" /> Personal Details
                </h3>
                {isEditing && <span className="text-xs text-[#FF6B35] font-medium animate-pulse bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">Editing Mode</span>}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-70 disabled:cursor-not-allowed appearance-none transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={!isEditing}
                        placeholder="City, Country"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>

                   <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Street address"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {isEditing && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700"
                    >
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
                      <Button 
                        type="submit" 
                        icon={saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                        disabled={saving}
                        className="bg-[#FF6B35] text-white hover:bg-[#e55a2b]"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>

            {/* Performance Stats (Only show if there is data) */}
            {(user.stats.totalOrders > 0 || user.stats.totalTickets > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-[#FF6B35]" /> Activity Overview
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 text-center hover:scale-105 transition-transform">
                       <div className="text-2xl font-bold text-[#FF6B35]">{user.stats.totalOrders}</div>
                       <div className="text-xs text-gray-500 uppercase font-semibold mt-1">Total Orders</div>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 text-center hover:scale-105 transition-transform">
                       <div className="text-2xl font-bold text-blue-600">{user.stats.totalReviews}</div>
                       <div className="text-xs text-gray-500 uppercase font-semibold mt-1">Reviews</div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 text-center hover:scale-105 transition-transform">
                       <div className="text-2xl font-bold text-purple-600">{user.stats.totalTickets}</div>
                       <div className="text-xs text-gray-500 uppercase font-semibold mt-1">Tickets</div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: Read-Only Info & System --- */}
          <div className="space-y-8">
            
            {/* Wallet Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
               <div className="relative z-10">
                 <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Wallet className="w-4 h-4" /> <span>Wallet Balance</span>
                 </div>
                 <div className="text-3xl font-bold mb-4 tracking-tight">
                   ₹{parseFloat(user.walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                 </div>
                 <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/10">
                    <span>Account Status</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                 </div>
               </div>
            </div>

            {/* Read-Only Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Shield className="w-4 h-4" /> Secure Contact Info
              </h3>
              <div className="space-y-4">
                 <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email Address</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={user.email || ""}>
                       {user.email || "Not provided"}
                    </div>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                       {user.countryCode} {user.contactNo || "Not provided"}
                    </div>
                 </div>
                 <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Contact details are locked for security. Contact Super Admin to update these.</span>
                 </div>
              </div>
            </div>

            {/* Roles List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Assigned Roles
               </h3>
               <div className="space-y-2">
                  {user.roles.length > 0 ? user.roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${role.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                             <Shield className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{role.name}</span>
                       </div>
                       <span className={`text-[10px] px-2 py-0.5 rounded-full ${role.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600'}`}>
                         {role.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500 italic p-2">No specific roles assigned.</div>
                  )}
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- PASSWORD MODAL --- */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showPasswords.current ? "text" : "password"} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
                        value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                      <button type="button" onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} className="absolute right-3 top-2.5 text-gray-400"><Eye className="w-4 h-4"/></button>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <div className="relative">
                      <input type={showPasswords.new ? "text" : "password"} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
                        value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                      <button type="button" onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})} className="absolute right-3 top-2.5 text-gray-400"><Eye className="w-4 h-4"/></button>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <div className="relative">
                      <input type={showPasswords.confirm ? "text" : "password"} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700"
                        value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                      <button type="button" onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} className="absolute right-3 top-2.5 text-gray-400"><Eye className="w-4 h-4"/></button>
                    </div>
                 </div>
                 <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowPasswordModal(false)} className="flex-1">Cancel</Button>
                    <Button type="submit" disabled={saving} className="flex-1 bg-[#FF6B35] text-white hover:bg-[#e55a2b]">{saving ? "Updating..." : "Update"}</Button>
                 </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}