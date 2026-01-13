"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit, Trash2, Loader2, Home, Building2, Map, ArrowLeft, X, Check } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if(res.ok) {
          toast.success(editingAddress ? "Address updated" : "Address added");
          setShowForm(false);
          setEditingAddress(null);
          setFormData({
            name: "", phoneNumber: "", flatNo: "", locality: "",
            city: "", state: "", country: "India", pincode: "",
          });
          fetchData();
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    }
  };

  const deleteAddress = async (id: string) => {
    if(!confirm("Delete this address?")) return;
    try {
      await fetch(`/api/landing/profile/addresses/${id}`, { method: "DELETE" });
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success("Address deleted");
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

  if (!profile && !loading) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 px-4 sm:px-0 pb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Link
                href="/profile"
                className="lg:hidden p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm"
            >
                <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Addresses
                </h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    Manage delivery locations.
                </p>
            </div>
        </div>
        
        {!showForm && (
            <button
                onClick={() => {
                    setEditingAddress(null);
                    setFormData({ name: "", phoneNumber: "", flatNo: "", locality: "", city: "", state: "", country: "India", pincode: "" });
                    setShowForm(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] text-white font-bold text-xs md:text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
            >
                <Plus className="h-4 w-4" />
                <span>Add New</span>
            </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm"
            >
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {editingAddress ? "Edit Address" : "New Address"}
                    </h3>
                    <button 
                        onClick={() => { setShowForm(false); setEditingAddress(null); }}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Full Name" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} />
                        <InputField label="Phone Number" type="tel" value={formData.phoneNumber} onChange={(e: any) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                        <div className="sm:col-span-2">
                            <InputField label="Flat / Building" value={formData.flatNo} onChange={(e: any) => setFormData({ ...formData, flatNo: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                            <InputField label="Area / Street" value={formData.locality} onChange={(e: any) => setFormData({ ...formData, locality: e.target.value })} />
                        </div>
                        <InputField label="City" value={formData.city} onChange={(e: any) => setFormData({ ...formData, city: e.target.value })} />
                        <InputField label="State" value={formData.state} onChange={(e: any) => setFormData({ ...formData, state: e.target.value })} />
                        <InputField label="Pincode" value={formData.pincode} onChange={(e: any) => setFormData({ ...formData, pincode: e.target.value })} />
                        <InputField label="Country" value={formData.country} disabled />
                    </div>
                    
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setEditingAddress(null); }}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#FF6B35] text-white font-bold text-sm hover:bg-[#e55a2b] transition-colors shadow-lg shadow-orange-500/20"
                        >
                            {editingAddress ? "Update" : "Save"}
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
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
                        <p className="text-xs text-gray-500">Loading addresses...</p>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 text-center">
                        <div className="h-14 w-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                            <MapPin className="h-7 w-7 text-blue-500" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Addresses</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-4 max-w-[200px]">
                            Add an address for faster checkout.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-5 py-2 rounded-lg border border-[#FF6B35] text-[#FF6B35] text-xs font-bold hover:bg-[#FF6B35] hover:text-white transition-all"
                        >
                            Add Address
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <AnimatePresence>
                        {addresses.map((address) => (
                            <motion.div
                                key={address.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 hover:border-[#FF6B35]/30 shadow-sm group relative"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-[#FF6B35]">
                                            <Home className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{address.name}</h3>
                                            <p className="text-[10px] text-gray-500 font-mono">{address.phoneNumber}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Actions - Always visible on mobile, hover on desktop */}
                                    <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(address)}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500"
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => deleteAddress(address.id)}
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <Building2 className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-1">{address.flatNo}, {address.locality}</span>
                                    </div>
                                    <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <Map className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span>{address.city}, {address.state} - <span className="font-mono font-semibold">{address.pincode}</span></span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact Input Field
function InputField({ label, ...props }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">{label}</label>
            <input
                {...props}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A] text-sm font-medium focus:bg-white dark:focus:bg-black focus:border-[#FF6B35] outline-none transition-all disabled:opacity-60"
            />
        </div>
    );
}