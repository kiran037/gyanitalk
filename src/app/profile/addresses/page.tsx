"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit, Trash2, Loader2, Home, Building2, Map, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddressesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    flatNo: "",
    locality: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, addressRes] = await Promise.all([
        fetch("/api/landing/profile"),
        fetch("/api/landing/profile/addresses"),
      ]);

      const profileData = await profileRes.json();
      const addressData = await addressRes.json();

      if (profileData.success) setProfile(profileData.data);
      if (addressData.success) setAddresses(addressData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingAddress
      ? `/api/landing/profile/addresses/${editingAddress.id}`
      : "/api/landing/profile/addresses";
    const method = editingAddress ? "PATCH" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        name: "", phoneNumber: "", flatNo: "", locality: "",
        city: "", state: "", country: "India", pincode: "",
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAddress = async (id: string) => {
    if(!confirm("Delete this address?")) return;
    try {
      await fetch(`/api/landing/profile/addresses/${id}`, { method: "DELETE" });
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phoneNumber: address.phoneNumber,
      flatNo: address.flatNo,
      locality: address.locality,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
    });
    setShowForm(true);
  };

  if (!profile) return null;

  return (
 <div className="w-full space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-start gap-4">
        <Link
          href="/profile"
          className="mt-1 rounded-xl border border-gray-100 bg-white p-2.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#111] dark:text-gray-200 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Saved Addresses
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 md:text-base">
            Manage delivery locations for products.
          </p>
        </div>
         {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a2b] transition-all shadow-lg shadow-[#FF6B35]/20"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add New</span>
                    </button>
                )}
      </div>
              <AnimatePresence mode="wait">
                {showForm ? (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingAddress ? "Edit Address" : "New Address"}</h3>
                        <button 
                            onClick={() => { setShowForm(false); setEditingAddress(null); }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                            <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                            <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] outline-none transition-all"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Flat / House No / Building</label>
                            <input
                            type="text"
                            value={formData.flatNo}
                            onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] outline-none transition-all"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Area / Locality / Street</label>
                            <input
                            type="text"
                            value={formData.locality}
                            onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">City</label>
                            <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">State</label>
                            <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Pincode</label>
                            <input
                            type="text"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] outline-none transition-all"
                            />
                        </div>
                      </div>
                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setEditingAddress(null);
                          }}
                          className="flex-1 px-4 py-3.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-3.5 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a2b] transition-colors shadow-lg shadow-orange-500/20"
                        >
                          {editingAddress ? "Update Address" : "Save Address"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-[300px]"
                    >
                         {loading ? (
                             <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5">
                                <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
                                <p className="text-sm text-gray-500">Loading addresses...</p>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 text-center px-4">
                                <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-6">
                                    <MapPin className="h-10 w-10 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Addresses Found</h3>
                                <p className="text-gray-500 max-w-sm mb-6">
                                Add an address to make checking out products easier.
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-2.5 rounded-xl bg-[#FF6B35] text-white font-bold hover:bg-[#e55a2b] transition-all"
                                >
                                    Add Your First Address
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((address) => (
                                <motion.div
                                    key={address.id}
                                    layout
                                    className="p-6 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-[#FF6B35]/30 hover:shadow-lg transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-[#FF6B35]">
                                                <Home className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{address.name}</h3>
                                                <p className="text-xs text-gray-500 font-mono">{address.phoneNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(address)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteAddress(address.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span>{address.flatNo}, {address.locality}</span>
                                        </div>
                                        <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Map className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span>{address.city}, {address.state} - <span className="font-mono font-semibold">{address.pincode}</span></span>
                                        </div>
                                    </div>
                                </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
              </AnimatePresence>
          </div>
  );
}