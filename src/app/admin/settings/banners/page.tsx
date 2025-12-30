"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Upload, Edit, Trash2, Sparkles, Clock, Eye } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { avatar } from "@/lib/images";

interface Banner {
  id: string;
  bannerImage: string | null;
  fromDate: Date;
  toDate: Date;
  bannerTypeId: string;
  isActive: boolean;
  bannerType?: { id: string; name: string };
}

interface BannerType {
  id: string;
  name: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerTypes, setBannerTypes] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    bannerImage: "",
    fromDate: "",
    toDate: "",
    bannerTypeId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchBanners();
    fetchBannerTypes();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/settings/banners");
      const data = await response.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const fetchBannerTypes = async () => {
    try {
      const response = await fetch("/api/settings/banners/types");
      const data = await response.json();
      if (data.success) {
        setBannerTypes(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch banner types");
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
      let imagePath = formData.bannerImage;

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, "banners");
        if (uploadResult.success) {
          imagePath = uploadResult.path;
        }
      }

      const url = selectedBanner
        ? `/api/settings/banners/${selectedBanner.id}`
        : "/api/settings/banners";

      const response = await fetch(url, {
        method: selectedBanner ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannerImage: imagePath,
          fromDate: new Date(formData.fromDate).toISOString(),
          toDate: new Date(formData.toDate).toISOString(),
          bannerTypeId: formData.bannerTypeId,
          isActive: true,
          createdBy: 1,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        fetchBanners();
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

  const handleToggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/settings/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !banner.isActive,
          modifiedBy: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Updated", `Banner ${banner.isActive ? "deactivated" : "activated"}`);
        fetchBanners();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/settings/banners/${selectedBanner.id}?modifiedBy=1`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        addToast("success", "Deleted", "Banner deleted successfully");
        fetchBanners();
        setIsDeleteModalOpen(false);
        setSelectedBanner(null);
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      bannerImage: banner.bannerImage || "",
      fromDate: new Date(banner.fromDate).toISOString().split("T")[0],
      toDate: new Date(banner.toDate).toISOString().split("T")[0],
      bannerTypeId: banner.bannerTypeId,
    });
    if (banner.bannerImage) {
      setImagePreview(avatar(banner.bannerImage));
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
    setFormData({ bannerImage: "", fromDate: "", toDate: "", bannerTypeId: "" });
    setImageFile(null);
    setImagePreview("");
  };

  const getBannerStatus = (banner: Banner) => {
    const now = new Date();
    const start = new Date(banner.fromDate);
    const end = new Date(banner.toDate);
    const isCurrent = banner.isActive && now >= start && now <= end;

    if (isCurrent) return { label: "Live", color: "emerald" };
    if (banner.isActive) return { label: "Scheduled", color: "gray" };
    return { label: "Inactive", color: "slate" };
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredBanners = banners;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Banner Management"
        subtitle="Manage promotional banners and schedules"
        badge={{ text: "Content", variant: "orange" }}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            New Banner
          </Button>
        }
      />

      {/* Banner Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="text-center py-20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Banners Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Create your first banner to get started with promotional content
          </p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Your First Banner
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-3 gap-6">
            {filteredBanners.map((banner) => {
              const status = getBannerStatus(banner);

              return (
                <div
                  key={banner.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <img
                      src={avatar(banner.bannerImage)}
                      alt="Banner"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(banner);
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-sm transition-transform active:scale-95 ${
                          status.color === 'emerald' ? 'bg-emerald-500/90 text-white' : ''
                        }${
                          status.color === 'gray' ? 'bg-gray-700/90 text-white' : ''
                        }${
                          status.color === 'slate' ? 'bg-slate-500/90 text-white' : ''
                        }`}
                        title={banner.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        {status.label}
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Type Badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500/10 to-orange-600/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                        {banner.bannerType?.name || "N/A"}
                      </span>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{formatDate(banner.fromDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{formatDate(banner.toDate)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBanner(banner);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        title="Delete banner"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedBanner ? "Edit Banner" : "Add Banner"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.fromDate}
              onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
              required
              icon={<Calendar className="w-4 h-4" />}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.toDate}
              onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
              required
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Banner Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bannerTypeId}
              onChange={(e) => setFormData({ ...formData, bannerTypeId: e.target.value })}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            >
              <option value="">Select Type</option>
              {bannerTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Banner Image <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 rounded-lg object-cover"
                />
              )}
              <label className="cursor-pointer block">
                <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Choose Banner Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!selectedBanner}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              {selectedBanner ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={submitting}
      />
    </div>
  );
}