"use client";

import { useState, useEffect } from "react";
import { Plus, Gift, Upload, DollarSign } from "lucide-react";
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

interface GiftItem {
  id: string;
  name: string;
  image: string | null;
  amount: number;
  displayOrder: number | null;
  isActive: boolean;
}

export default function GiftsPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    displayOrder: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await fetch("/api/settings/gifts");
      const data = await response.json();
      if (data.success) {
        setGifts(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch gifts");
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
        const uploadResult = await uploadImage(imageFile, "gifts");
        if (uploadResult.success) {
          imagePath = uploadResult.path;
        }
      }

      const url = selectedGift
        ? `/api/settings/gifts/${selectedGift.id}`
        : "/api/settings/gifts";

      const response = await fetch(url, {
        method: selectedGift ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: imagePath || null,
          amount: parseFloat(formData.amount),
          displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : null,
          isActive: true,
          createdBy: 1,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        fetchGifts();
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

  const handleToggleActive = async (gift: GiftItem) => {
    try {
      const response = await fetch(`/api/settings/gifts/${gift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !gift.isActive,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Updated", `Gift ${gift.isActive ? "deactivated" : "activated"}`);
        fetchGifts();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!selectedGift) return;
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/settings/gifts/${selectedGift.id}?modifiedBy=1`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        addToast("success", "Deleted", "Gift deleted successfully");
        fetchGifts();
        setIsDeleteModalOpen(false);
        setSelectedGift(null);
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (gift: GiftItem) => {
    setSelectedGift(gift);
    setFormData({
      name: gift.name,
      amount: gift.amount.toString(),
      displayOrder: gift.displayOrder?.toString() || "",
      image: gift.image || "",
    });
    if (gift.image) {
      setImagePreview(avatar(gift.image));
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGift(null);
    setFormData({ name: "", amount: "", displayOrder: "", image: "" });
    setImageFile(null);
    setImagePreview("");
  };

  const filteredGifts = gifts.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "image",
      label: "Preview",
      render: (item: GiftItem) =>
        item.image ? (
          <img src={avatar(item.image)} alt={item.name} className="w-12 h-12 rounded object-cover" />
        ) : (
          <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Gift className="w-6 h-6 text-gray-400" />
          </div>
        ),
    },
    { key: "name", label: "Name" },
    {
      key: "amount",
      label: "Amount",
      render: (item: GiftItem) => `₹${item.amount}`,
    },
    {
      key: "displayOrder",
      label: "Order",
      render: (item: GiftItem) => item.displayOrder || "—",
    },
    {
      key: "isActive",
      label: "Status",
      render: (item: GiftItem) => (
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
        title="Gifts"
        subtitle="Manage virtual gifts for astrologers"
        badge={{ text: "Content", variant: "purple" }}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Gift
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search gifts..."
          />
        </div>
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Gifts</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{gifts.length}</div>
        </motion.div>
      </div>

      <SettingsTable
        data={filteredGifts}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(gift) => {
          setSelectedGift(gift);
          setIsDeleteModalOpen(true);
        }}
        onToggleActive={handleToggleActive}
        loading={loading}
        emptyMessage="No gifts found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedGift ? "Edit Gift" : "Add Gift"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Gift Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Rose"
            required
            icon={<Gift className="w-4 h-4" />}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="99"
              required
              step="0.01"
              icon={<DollarSign className="w-4 h-4" />}
            />
            <Input
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gift Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded object-cover" />
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
              {selectedGift ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Gift"
        message={`Are you sure you want to delete ${selectedGift?.name}?`}
        confirmText="Delete"
        type="danger"
        loading={submitting}
      />
    </div>
  );
}