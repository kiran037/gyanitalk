"use client";

import { useState, useEffect } from "react";
import { Plus, Star, Edit2, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { motion } from "framer-motion";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface HoroscopeSign {
  id: string;
  name: string;
  image: string;
  displayOrder: number | null;
  isActive: boolean;
  created_at: Date | null;
}

export default function HoroscopeSignsPage() {
  const [signs, setSigns] = useState<HoroscopeSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSign, setSelectedSign] = useState<HoroscopeSign | null>(null);
  const [formData, setFormData] = useState({ name: "", displayOrder: "", image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchSigns();
  }, []);

  const fetchSigns = async () => {
    try {
      const response = await fetch("/api/settings/horoscope-signs");
      const data = await response.json();
      if (data.success) {
        setSigns(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch horoscope signs");
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
      let imagePath = formData.image;

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, "horoscope-signs");
        if (uploadResult.success) {
          imagePath = uploadResult.path;
        }
      }

      const url = selectedSign
        ? `/api/settings/horoscope-signs/${selectedSign.id}`
        : "/api/settings/horoscope-signs";

      const response = await fetch(url, {
        method: selectedSign ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: imagePath,
          displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : null,
          isActive: true,
          createdBy: 1,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        fetchSigns();
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

  const handleToggleActive = async (sign: HoroscopeSign) => {
    try {
      const response = await fetch(`/api/settings/horoscope-signs/${sign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !sign.isActive,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Updated", `Sign ${sign.isActive ? "deactivated" : "activated"}`);
        fetchSigns();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update status");
    }
  };


  const handleEdit = (sign: HoroscopeSign) => {
    setSelectedSign(sign);
    setFormData({
      name: sign.name,
      displayOrder: sign.displayOrder?.toString() || "",
      image: sign.image,
    });
    setImagePreview(avatar(sign.image));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSign(null);
    setFormData({ name: "", displayOrder: "", image: "" });
    setImageFile(null);
    setImagePreview("");
  };

  const filteredSigns = signs.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horoscope Signs"
        subtitle="Manage zodiac signs and their images"
        badge={{ text: "Content", variant: "purple" }}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search signs..."
          />
        </div>
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Signs</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{signs.length}</div>
        </motion.div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/60 dark:bg-white/5 rounded-xl p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {filteredSigns.map((sign, index) => (
            <motion.div
              key={sign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
            >
              <div className="relative aspect-square">
                <img
                  src={avatar(sign.image)}
                  alt={sign.name}
                  className="w-full p-8 h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleToggleActive(sign)}
                    className="p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg hover:scale-110 transition-transform"
                  >
                    {sign.isActive ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">{sign.name}</h3>
                  {sign.displayOrder && (
                    <span className="text-xs text-gray-500">#{sign.displayOrder}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit2 className="w-3 h-3" />}
                    onClick={() => handleEdit(sign)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                 
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSign ? "Edit Horoscope Sign" : "Add Horoscope Sign"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Sign Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Aries"
            required
            icon={<Star className="w-4 h-4" />}
          />
          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
            placeholder="Optional"
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sign Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
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
                />
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              {selectedSign ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}