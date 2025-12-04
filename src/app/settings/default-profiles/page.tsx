"use client";

import { useState, useEffect } from "react";
import { Plus, User, Upload } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { SettingsTable } from "@/components/settings/SettingsTable";
import { useToast } from "@/components/Toast/ToastProvider";
import { motion } from "framer-motion";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface DefaultProfile {
  id: number;
  name: string;
  profile: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}

export default function DefaultProfilesPage() {
  const [profiles, setProfiles] = useState<DefaultProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<DefaultProfile | null>(null);
  const [formData, setFormData] = useState({ name: "", profile: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/settings/default-profiles");
      const data = await response.json();
      if (data.success) {
        setProfiles(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let profilePath = formData.profile;

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, "default-profiles");
        if (uploadResult.success) {
          profilePath = uploadResult.path;
        }
      }

      const url = selectedProfile
        ? `/api/settings/default-profiles/${selectedProfile.id}`
        : "/api/settings/default-profiles";

      const response = await fetch(url, {
        method: selectedProfile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          profile: profilePath,
          isActive: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        fetchProfiles();
        handleCloseModal();
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (profile: DefaultProfile) => {
    try {
      const response = await fetch(`/api/settings/default-profiles/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !profile.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Updated", `Profile ${profile.isActive ? "deactivated" : "activated"}`);
        fetchProfiles();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update status");
    }
  };

  const handleEdit = (profile: DefaultProfile) => {
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      profile: profile.profile,
    });
    setImagePreview(avatar(profile.profile));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
    setFormData({ name: "", profile: "" });
    setImageFile(null);
    setImagePreview("");
  };

  const filteredProfiles = profiles.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "profile",
      label: "Preview",
      render: (item: DefaultProfile) => (
        <img
          src={avatar(item.profile)}
          alt={item.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      ),
    },
    { key: "name", label: "Name" },
    {
      key: "isActive",
      label: "Status",
      render: (item: DefaultProfile) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            item.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Default Profiles"
        subtitle="Manage default profile pictures for new users"
        badge={{ text: "Content", variant: "purple" }}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search profiles..."
          />
        </div>
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Profiles</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{profiles.length}</div>
        </motion.div>
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {profiles.filter((p) => p.isActive).length}
          </div>
        </motion.div>
      </div>

      <SettingsTable
        data={filteredProfiles}
        columns={columns}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        loading={loading}
        emptyMessage="No profiles found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProfile ? "Edit Profile" : "Add Profile"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Profile Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Male Default 1"
            required
            icon={<User className="w-4 h-4" />}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <label className="flex-1 cursor-pointer">
                <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Choose Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!selectedProfile}
                />
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              {selectedProfile ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}