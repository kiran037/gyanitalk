"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Trash2, AlertTriangle, Loader2, CheckCircle2, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"temp" | "perm">("temp");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
        const res = await fetch("/api/landing/profile");
        const data = await res.json();
        if (data.success) setProfile(data.data);
    } catch (e) {
        console.error(e)
    } finally {
        setInitialLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        const res = await fetch("/api/landing/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
        });

        const data = await res.json();

        if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
        setMessage({ type: "error", text: data.error });
        }
    } catch (error) {
         setMessage({ type: "error", text: "Something went wrong" });
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const endpoint = deleteType === "temp" 
      ? "/api/landing/profile/delete/temporary"
      : "/api/landing/profile/delete/permanent";
    
    const body = deleteType === "perm" ? { confirmation: "DELETE_MY_ACCOUNT" } : {};

    try {
        const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        });

        if (res.ok) {
        window.location.href = "/";
        }
    } catch (error) {
        console.error(error);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
        <p className="text-sm text-gray-500">Loading security settings...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      
      {/* Header with Back Button */}
      <div className="flex items-start gap-4">
        <Link 
          href="/profile" 
          className="lg:hidden mt-1 p-2.5 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Login & Security</h1>
           <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Manage your password and account protection.</p>
        </div>
      </div>

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
      >
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/10 text-[#FF6B35]">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
            <p className="text-xs text-gray-500">Ensure your account is using a strong password</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1.5 block">Current Password</label>
                    <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] focus:ring-4 focus:ring-[#FF6B35]/10 focus:border-[#FF6B35] outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1.5 block">New Password</label>
                    <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] focus:ring-4 focus:ring-[#FF6B35]/10 focus:border-[#FF6B35] outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 mb-1.5 block">Confirm Password</label>
                    <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] focus:ring-4 focus:ring-[#FF6B35]/10 focus:border-[#FF6B35] outline-none transition-all"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-xl ${
                        message.type === "success"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    }`}
                    >
                    {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="text-sm font-semibold">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Updating...</span>
                    ) : "Update Password"}
                </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-red-200 dark:border-red-900/50 overflow-hidden"
      >
         <div className="p-5 md:p-6 bg-red-50/50 dark:bg-red-900/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600">
                <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">Irreversible account actions</p>
            </div>
        </div>
        
        <div className="p-6 md:p-8 bg-white dark:bg-[#111]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Account</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                        Once you delete your account, there is no going back. Please be certain about this action.
                    </p>
                </div>
                <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold border border-red-200 hover:bg-red-600 hover:text-white transition-all w-full md:w-auto"
                >
                <Trash2 className="h-4 w-4" />
                Delete Account
                </button>
            </div>
        </div>
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#111] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-white/10"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
            </div>
            
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Delete Account</h3>
            <p className="text-center text-gray-500 text-sm mb-6">Select how you want to proceed with account deletion.</p>

            <div className="space-y-3 mb-8">
              <label className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${deleteType === 'temp' ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                <div className="pt-1">
                    <input
                    type="radio"
                    name="deleteType"
                    checked={deleteType === "temp"}
                    onChange={() => setDeleteType("temp")}
                    className="w-4 h-4 accent-[#FF6B35]"
                    />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Temporary Deactivation</p>
                  <p className="text-xs text-gray-500 mt-0.5">Account can be restored within 20 days by logging in.</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${deleteType === 'perm' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                <div className="pt-1">
                    <input
                    type="radio"
                    name="deleteType"
                    checked={deleteType === "perm"}
                    onChange={() => setDeleteType("perm")}
                    className="w-4 h-4 accent-red-600"
                    />
                </div>
                <div>
                  <p className="font-bold text-red-600 text-sm">Permanent Deletion</p>
                  <p className="text-xs text-gray-500 mt-0.5">All data will be wiped immediately. This cannot be undone.</p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
              >
                {deleteType === 'perm' ? 'Delete Forever' : 'Deactivate'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}