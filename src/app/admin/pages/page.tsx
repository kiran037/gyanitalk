"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { useToast } from "@/components/Toast/ToastProvider";
import { Plus, Edit, Eye, AlertCircle, CheckCircle, XCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import PageFormModal from "@/components/pages/PageFormModal";
import type { PageListItem, PageStats } from "@/types/page";

export default function PageManagementPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [stats, setStats] = useState<PageStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const addToast = useToast();

  useEffect(() => {
    fetchPages();
  }, [search, activeFilter]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (activeFilter !== "") params.append("isActive", activeFilter);

      const res = await fetch(`/api/pages?${params}`);
      const data = await res.json();

      if (data.success) {
        setPages(data.data.pages);
        setAvailableTypes(data.data.availableTypes);
        setStats(data.data.stats);
      } else {
        addToast("error", "Error", data.error || "Failed to fetch pages");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch pages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const res = await fetch(`/api/pages/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        fetchPages();
      } else {
        addToast("error", "Error", data.error || "Failed to toggle page status");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to toggle page status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", "Page deleted successfully");
        fetchPages();
      } else {
        addToast("error", "Error", data.error || "Failed to delete page");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete page");
    }
  };

  const handleCreate = () => {
    setSelectedPageId(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPageId(null);
    fetchPages();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      privacy: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      terms: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      aboutus: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      aboutus: "About Us",
    };
    return labels[type] || type;
  };

  return (

          <div className="min-h-screen space-y-6 bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <PageHeader
        title="Page Management"
        subtitle="Manage your website pages (Privacy, Terms, About Us)"
        badge={{ text: "CMS", variant: "blue" }}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreate}
            disabled={availableTypes.length === 0}
          >
            Create New Page
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 rounded-lg">
              <FileText className="w-6 h-6 text-[#FF6B35]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Pages</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Pages</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search pages by title or slug..."
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant={activeFilter === "" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("")}
            >
              All
            </Button>
            <Button
              variant={activeFilter === "true" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("true")}
            >
              Active
            </Button>
            <Button
              variant={activeFilter === "false" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("false")}
            >
              Inactive
            </Button>
          </div>
        </div>
      </div>

      {/* Available Types Alert */}
      {availableTypes.length > 0 && (
        <motion.div
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Missing Pages
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You can create pages for: {availableTypes.map(getTypeLabel).join(", ")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No pages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pages.map((page) => (
                  <motion.tr
                    key={page.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {page.title || "Untitled"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          /{page.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(page.type)}`}>
                        {getTypeLabel(page.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(page.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                          page.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-900/50"
                        }`}
                      >
                        {page.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                          onClick={() => window.open(`/${page.slug}`, "_blank")}
                          ariaLabel="View page"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => router.push(`/admin/pages/${page.id}`)}
                          ariaLabel="Edit page"
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <PageFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        pageId={selectedPageId}
        availableTypes={availableTypes}
      />
    </div>
  );
}