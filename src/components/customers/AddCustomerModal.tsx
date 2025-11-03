// src/components/customers/AddCustomerModal.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import GlassModal from "@/components/GlassUI/GlassModal";
import { glass } from "@/components/GlassUI/GlassKit";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { addCustomer } from "@/app/customers/fetch";

export default function AddCustomerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string>("");

  const [newUser, setNewUser] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    pincode: "",
    city: "",
    gender: "",
    email: "",
    contactNo: "",
    address: "",
    profile: "",
  });

  const handleAddUserChange = (field: string, value: string) =>
    setNewUser((prev) => ({ ...prev, [field]: value }));

  async function uploadProfileAndGetPath(file: File) {
    const up = await uploadImage(file, "images", "public/storage");
    if (!up?.success || !up?.mainPath) {
      throw new Error("Upload failed. Please try again.");
    }
    return up.mainPath as string;
  }

  async function onConfirmAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser.name) {
      toast("warning", "Name Required", "Customer name is mandatory");
      return;
    }
    setIsAddingUser(true);
    const res = await addCustomer(newUser);
    setIsAddingUser(false);
    if (res?.status) {
      toast("success", "Added", res.message);
      onClose();
    } else {
      toast("error", "Error", res.message || "Could not add user");
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Add New Customer" maxWidth="max-w-2xl">
      <form onSubmit={onConfirmAddUser} className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
        {/* Profile image upload */}
        <div>
          <label className="block text-sm mb-1">Profile Image</label>
          <div className="flex items-center gap-3">
            {profilePreview ? (
              <Image
                src={profilePreview}
                width={48}
                height={48}
                alt="Preview"
                className="rounded-full object-cover ring-2 ring-white/70 dark:ring-white/10"
              />
            ) : null}
            <input
              type="file"
              accept="image/*"
              disabled={isUploadingProfile}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setIsUploadingProfile(true);
                  const localUrl = URL.createObjectURL(file);
                  setProfilePreview(localUrl);
                  const path = await uploadProfileAndGetPath(file);
                  handleAddUserChange("profile", path);
                  setProfilePreview(`${path}`);
                } catch (err: any) {
                  setProfilePreview("");
                  handleAddUserChange("profile", "");
                  toast("error", "Upload Failed", err?.message || "Could not upload image.");
                } finally {
                  setIsUploadingProfile(false);
                }
              }}
            />
          </div>
          {isUploadingProfile ? (
            <p className="text-xs text-slate-500 mt-1">Uploading…</p>
          ) : newUser.profile ? (
            <p className="text-xs text-emerald-600 mt-1">Uploaded ✓ (saved path: {newUser.profile})</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => handleAddUserChange("name", e.target.value)}
            className={glass.input}
          />
          <input
            type="text"
            placeholder="Contact No."
            value={newUser.contactNo}
            onChange={(e) => handleAddUserChange("contactNo", e.target.value)}
            className={glass.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => handleAddUserChange("email", e.target.value)}
            className={glass.input}
          />
          <input
            type="date"
            value={newUser.birthDate}
            onChange={(e) => handleAddUserChange("birthDate", e.target.value)}
            className={glass.input}
          />
          <input
            type="time"
            value={newUser.birthTime}
            onChange={(e) => handleAddUserChange("birthTime", e.target.value)}
            className={glass.input}
          />
          <input
            type="text"
            placeholder="Pincode"
            value={newUser.pincode}
            onChange={(e) => handleAddUserChange("pincode", e.target.value)}
            className={glass.input}
          />
          <input
            type="text"
            placeholder="City"
            value={newUser.city}
            onChange={(e) => handleAddUserChange("city", e.target.value)}
            className={glass.input}
          />
          <select
            value={newUser.gender}
            onChange={(e) => handleAddUserChange("gender", e.target.value)}
            className={glass.input}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <textarea
          placeholder="Current Address"
          value={newUser.address}
          onChange={(e) => handleAddUserChange("address", e.target.value)}
          className={glass.input + " w-full"}
        />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={glass.btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={isAddingUser} className={glass.btnPrimary}>
            {isAddingUser ? "Adding…" : "Add User"}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
