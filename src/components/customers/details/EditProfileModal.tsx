"use client";

import Image from "next/image";
import GlassModal from "@/components/GlassUI/GlassModal";
import GlassButton from "@/components/GlassUI/GlassButton";
import { Camera, Save, X } from "lucide-react";
import { Field, SelectField, TextArea } from "./Fields";

export default function EditProfileModal({
  open,
  onClose,
  profileSrc,
  saving,
  values,
  onFile,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  profileSrc: string;
  saving: boolean;
  values: any;
  onFile: (file: File | null) => void;
  onChange: (e: any) => void;
  onSubmit: (e: any) => void;
}) {
  return (
    <GlassModal open={open} onClose={onClose} title="Edit Profile" maxWidth="max-w-4xl">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/60 dark:bg-white/[0.06] border border-white/60 dark:border-white/10">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/70 dark:ring-white/10 shadow">
              <Image src={profileSrc} alt="preview" width={96} height={96} className="h-full w-full object-cover" />
            </div>
            <label className="absolute -bottom-2 -right-2 inline-flex items-center justify-center h-9 w-9 rounded-xl cursor-pointer text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:scale-105 transition">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Profile Picture</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Click the camera icon to upload a new photo.</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Full Name" name="name" value={values.name || ""} onChange={onChange} required />
          <Field label="Contact Number" name="contactNo" value={values.contactNo || ""} onChange={onChange} inputMode="tel" />
          <Field label="Email Address" name="email" type="email" value={values.email || ""} onChange={onChange} />
          <SelectField
            label="Gender"
            name="gender"
            value={values.gender || ""}
            onChange={onChange}
            options={[
              { label: "Select Gender", value: "" },
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]}
          />
          <Field label="Birth Date" name="birthDate" type="date" value={values.birthDate || ""} onChange={onChange} />
          <Field label="Birth Time" name="birthTime" type="time" value={values.birthTime || ""} onChange={onChange} />
          <Field label="Birth Place" name="birthPlace" value={values.birthPlace || ""} onChange={onChange} placeholder="Enter your birth place" />
          <Field label="City" name="city" value={values.city || ""} onChange={onChange} placeholder="Enter your city" />
          <Field label="Pin Code" name="pincode" value={values.pincode || ""} onChange={onChange} inputMode="numeric" pattern="\\d{4,8}" placeholder="Enter your pin code" />
          <TextArea className="md:col-span-2" label="Address" name="addressLine1" value={values.addressLine1 || ""} onChange={onChange} rows={3} placeholder="Enter your complete address" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <GlassButton variant="ghost" onClick={onClose} icon={X} type="button">
            Close
          </GlassButton>
          <GlassButton type="submit" icon={Save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
