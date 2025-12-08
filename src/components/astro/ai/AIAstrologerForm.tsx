"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { Upload, X } from "lucide-react";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface AIAstrologerFormProps {
  isOpen: boolean;
  onClose: () => void;
  aiAstrologer: any | null;
  onSuccess: () => void;
}

interface SkillOption {
  id: string;
  name: string;
}

export function AIAstrologerForm({
  isOpen,
  onClose,
  aiAstrologer,
  onSuccess,
}: AIAstrologerFormProps) {
  const addToast = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [availableSkills, setAvailableSkills] = useState<SkillOption[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [allSkillsSelectValue, setAllSkillsSelectValue] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    about: "",
    astrologerCategoryId: "",
    primary_skill: "",
    all_skills: "",
    chat_charge: "",
    chat_charge_usd: "",
    experience: "",
    system_intruction: "",
    slug: "",
    type: "",
    aiType: "",
    referral_code: "",
    featured: 0,
  });

  useEffect(() => {
    if (aiAstrologer) {
      const rawAllSkills: string[] = (aiAstrologer.all_skills || "")
        .toString()
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

      setFormData({
        name: aiAstrologer.name || "",
        image: aiAstrologer.image || "",
        about: aiAstrologer.about || "",
        astrologerCategoryId: aiAstrologer.astrologerCategoryId || "",
        primary_skill: aiAstrologer.primary_skill
          ? aiAstrologer.primary_skill.toString()
          : "",
        all_skills: rawAllSkills.join(","),
        chat_charge: aiAstrologer.chat_charge?.toString() || "",
        chat_charge_usd: aiAstrologer.chat_charge_usd?.toString() || "",
        experience: aiAstrologer.experience || "",
        system_intruction: aiAstrologer.system_intruction || "",
        slug: aiAstrologer.slug || "",
        type: aiAstrologer.type || "",
        aiType: aiAstrologer.aiType || "",
        referral_code: aiAstrologer.referral_code || "",
        featured: aiAstrologer.featured || 0,
      });

      setSelectedSkillIds(rawAllSkills);

      setAvailableSkills(
        (aiAstrologer.availableSkills || []).map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
        }))
      );
    } else {
      setFormData({
        name: "",
        image: "",
        about: "",
        astrologerCategoryId: "",
        primary_skill: "",
        all_skills: "",
        chat_charge: "",
        chat_charge_usd: "",
        experience: "",
        system_intruction: "",
        slug: "",
        type: "",
        aiType: "",
        referral_code: "",
        featured: 0,
      });
      setSelectedSkillIds([]);
      setAvailableSkills([]);
    }
    setAllSkillsSelectValue("");
  }, [aiAstrologer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImage(file, "ai-astrologers");
      if (result.success) {
        setFormData((prev) => ({ ...prev, image: result.path }));
        addToast("success", "Success", "Image uploaded successfully");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handlePrimarySkillChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, primary_skill: value }));
  };

  const handleAddSkill = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    if (selectedSkillIds.includes(value)) {
      setAllSkillsSelectValue("");
      return;
    }

    const updated = [...selectedSkillIds, value];
    setSelectedSkillIds(updated);
    setFormData((prev) => ({
      ...prev,
      all_skills: updated.join(","),
    }));
    setAllSkillsSelectValue("");
  };

  const handleRemoveSkill = (id: string) => {
    const updated = selectedSkillIds.filter((skillId) => skillId !== id);
    setSelectedSkillIds(updated);
    setFormData((prev) => ({
      ...prev,
      all_skills: updated.join(","),
    }));

    if (formData.primary_skill === id) {
      setFormData((prev) => ({ ...prev, primary_skill: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = aiAstrologer
        ? `/api/ai-astrologers/${aiAstrologer.id}`
        : "/api/ai-astrologers";

      const method = aiAstrologer ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast(
          "success",
          "Success",
          aiAstrologer
            ? "AI Astrologer updated successfully"
            : "AI Astrologer created successfully"
        );
        onSuccess();
      } else {
        addToast(
          "error",
          "Error",
          data.error || "Failed to save AI Astrologer"
        );
      }
    } catch (error) {
      console.error("Error saving AI Astrologer:", error);
      addToast("error", "Error", "Failed to save AI Astrologer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={aiAstrologer ? "Edit AI Astrologer" : "Create AI Astrologer"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
            Profile Image
          </label>
          <div className="flex items-center gap-4">
            {formData.image && (
              <img
                src={avatar(formData.image)}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Image"}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
          />
          <Input
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="e.g., premium, basic"
          />
          <Input
            label="AI Type"
            name="aiType"
            value={formData.aiType}
            onChange={handleChange}
            placeholder="e.g., openai, gemini"
          />
        </div>

        {/* About */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
            About
          </label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
        </div>

        {/* Skills & Experience */}
        {/* Skills & Experience */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr,1fr] gap-4">
          {/* Primary Skill dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Skill
            </label>
            <select
              name="primary_skill"
              value={formData.primary_skill}
              onChange={handlePrimarySkillChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            >
              <option value="">Select primary skill</option>
              {availableSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          {/* All Skills: badges + inline dropdown IN ONE FIELD */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              All Skills
            </label>

            <div className="w-full min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 flex flex-wrap items-center gap-2">
              {/* Selected badges */}
              {selectedSkillIds.length === 0 && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Add skills from the dropdown…
                </span>
              )}

              {selectedSkillIds.map((id) => {
                const skill = availableSkills.find((s) => s.id === id);
                const label = skill?.name || id;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-[11px] text-orange-800 dark:text-orange-200 border border-orange-200/70 dark:border-orange-800/70"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(id)}
                      className="p-0.5 rounded-full hover:bg-orange-100 dark:hover:bg-orange-800/60"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}

              {/* Inline dropdown inside same field */}
              <select
                value={allSkillsSelectValue}
                onChange={handleAddSkill}
                className="ml-1 h-8 min-w-[130px] bg-transparent border-none text-[12px] text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-0"
              >
                <option value="">Add skill…</option>
                {availableSkills
                  .filter((s) => !selectedSkillIds.includes(s.id))
                  .map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Experience */}
          <Input
            label="Experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="e.g., 8 years"
          />
        </div>

        {/* Charges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label="Chat Charge (INR)"
            name="chat_charge"
            type="number"
            value={formData.chat_charge}
            onChange={handleChange}
          />
          <Input
            label="Chat Charge (USD)"
            name="chat_charge_usd"
            type="number"
            value={formData.chat_charge_usd}
            onChange={handleChange}
          />
          <Input
            label="Referral Code"
            name="referral_code"
            value={formData.referral_code}
            onChange={handleChange}
          />
        </div>

        {/* Category */}
        <Input
          label="Category IDs"
          name="astrologerCategoryId"
          value={formData.astrologerCategoryId}
          onChange={handleChange}
          placeholder="Comma separated category IDs"
        />

        {/* System Instruction */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
            System Instruction
          </label>
          <textarea
            name="system_intruction"
            value={formData.system_intruction}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 font-mono"
            placeholder="Enter AI system instructions..."
          />
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Featured
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Highlight this AI astrologer on the platform
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                featured: prev.featured === 1 ? 0 : 1,
              }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.featured === 1
              ? "bg-[#FF6B35]"
              : "bg-gray-200 dark:bg-gray-700"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.featured === 1 ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {aiAstrologer ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}