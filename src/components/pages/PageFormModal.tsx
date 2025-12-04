"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { RichTextEditor } from "@/components/courses/RichTextEditor";
import { useToast } from "@/components/Toast/ToastProvider";
import { Save, Loader2, AlertCircle} from "lucide-react";
import type { SEOAnalysis } from "@/types/page";

interface PageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: number | null;
  availableTypes: string[];
}

export default function PageFormModal({ isOpen, onClose, pageId, availableTypes }: PageFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const addToast = useToast();

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    slug: "",
    description: "",
    isActive: true,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    schemaJson: "",
  });

  // Fetch full page data when editing
  useEffect(() => {
    if (pageId && isOpen) {
      fetchFullPageData(pageId);
    } else if (!pageId && isOpen) {
      // Reset form for create
      setFormData({
        type: availableTypes[0] || "",
        title: "",
        slug: "",
        description: "",
        isActive: true,
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        twitterTitle: "",
        twitterDescription: "",
        twitterImage: "",
        schemaJson: "",
      });
      setSeoAnalysis(null);
    }
  }, [pageId, isOpen, availableTypes]);

  const fetchFullPageData = async (id: number) => {
    setLoadingPage(true);
    try {
      const res = await fetch(`/api/pages/${id}`);
      const data = await res.json();

      if (data.success) {
        const pageData = data.data.page;
        setFormData({
          type: pageData.type || "",
          title: pageData.title || "",
          slug: pageData.slug || "",
          description: pageData.description || "",
          isActive: pageData.isActive ?? true,
          metaTitle: pageData.metaTitle || "",
          metaDescription: pageData.metaDescription || "",
          metaKeywords: pageData.metaKeywords || "",
          canonicalUrl: pageData.canonicalUrl || "",
          ogTitle: pageData.ogTitle || "",
          ogDescription: pageData.ogDescription || "",
          ogImage: pageData.ogImage || "",
          twitterTitle: pageData.twitterTitle || "",
          twitterDescription: pageData.twitterDescription || "",
          twitterImage: pageData.twitterImage || "",
          schemaJson: pageData.schemaJson || "",
        });
        setSeoAnalysis(data.data.seoAnalysis);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch page data");
    } finally {
      setLoadingPage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = pageId ? `/api/pages/${pageId}` : "/api/pages";
      const method = pageId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        onClose();
      } else {
        addToast("error", "Error", data.error || "Failed to save page");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save page");
    } finally {
      setLoading(false);
    }
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pageId ? "Edit Page" : "Create New Page"}
      size="xl"
    >
      {loadingPage ? (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading page data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEO Score */}
          {seoAnalysis && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SEO Score</h3>
                <div className={`text-2xl font-bold ${getSEOScoreColor(seoAnalysis.score)}`}>
                  {seoAnalysis.score}/100
                </div>
              </div>
              {seoAnalysis.issues.length > 0 && (
                <div className="space-y-1">
                  {seoAnalysis.issues.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={!!pageId}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 disabled:opacity-50"
              >
                {pageId ? (
                  <option value={formData.type}>{getTypeLabel(formData.type)}</option>
                ) : (
                  <>
                    <option value="">Select page type</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {getTypeLabel(type)}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Page
                </span>
              </label>
            </div>
          </div>

          <Input
            label="Page Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter page title"
            required
          />

          <div className="flex gap-2">
            <Input
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="page-url-slug"
              required
              className="flex-1"
            />
            <div className="pt-7">
              <Button type="button" variant="outline" size="sm" onClick={generateSlug}>
                Generate
              </Button>
            </div>
          </div>

          <RichTextEditor
            label="Page Content"
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Enter page content with formatting..."
          />

          {/* SEO Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SEO Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Meta Title"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder="50-60 characters"
              />
              <Input
                label="Canonical URL"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleChange}
                placeholder="/page-url"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows={2}
                placeholder="120-160 characters"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              />
            </div>

            <div className="mt-4">
              <Input
                label="Meta Keywords"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleChange}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>

          {/* Open Graph */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Open Graph (Facebook)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="OG Title"
                name="ogTitle"
                value={formData.ogTitle}
                onChange={handleChange}
                placeholder="Facebook share title"
              />
              <Input
                label="OG Image URL"
                name="ogImage"
                value={formData.ogImage}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                OG Description
              </label>
              <textarea
                name="ogDescription"
                value={formData.ogDescription}
                onChange={handleChange}
                rows={2}
                placeholder="Description for Facebook shares"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              />
            </div>
          </div>

          {/* Twitter Card */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Twitter Card</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Twitter Title"
                name="twitterTitle"
                value={formData.twitterTitle}
                onChange={handleChange}
                placeholder="Twitter share title"
              />
              <Input
                label="Twitter Image URL"
                name="twitterImage"
                value={formData.twitterImage}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter Description
              </label>
              <textarea
                name="twitterDescription"
                value={formData.twitterDescription}
                onChange={handleChange}
                rows={2}
                placeholder="Description for Twitter shares"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              />
            </div>
          </div>

          {/* Schema JSON */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schema.org JSON-LD</h3>
            <textarea
              name="schemaJson"
              value={formData.schemaJson}
              onChange={handleChange}
              rows={4}
              placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} icon={<Save className="w-4 h-4" />}>
              {pageId ? "Update Page" : "Create Page"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}