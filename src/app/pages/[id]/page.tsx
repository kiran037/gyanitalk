"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { Input } from "@/components/adminUI/Input";
import { RichTextEditor } from "@/components/courses/RichTextEditor";
import { useToast } from "@/components/Toast/ToastProvider";
import { Save, ArrowLeft, Eye, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { SEOAnalysis } from "@/types/page";

export default function PageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  const addToast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);

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

    const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
    </button>
  );

  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}`);
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
      } else {
        addToast("error", "Error", data.error || "Failed to fetch page");
        router.push("/pages");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch page");
      router.push("/pages");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", "Page updated successfully");
        setSeoAnalysis(data.data?.seoAnalysis || null);
        fetchPageData(); // Refresh data
      } else {
        addToast("error", "Error", data.error || "Failed to update page");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    handleSubmit();
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getSEOScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    if (score >= 40) return "bg-orange-100 dark:bg-orange-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      aboutus: "About Us",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      privacy: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      terms: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      aboutus: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <PageHeader
        title={formData.title || "Edit Page"}
        subtitle={`/${formData.slug}`}
        badge={{
          text: getTypeLabel(formData.type),
          variant: formData.type === "privacy" ? "blue" : formData.type === "terms" ? "purple" : "green",
        }}
        leftActions={<BackButton />}
        actions={
          <div className="flex items-center gap-2">
            
            <Button
              variant="primary"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => window.open(`/landing/${formData.slug}`, "_blank")}
            >
              Preview
            </Button>
          </div>
        }
      />

      {/* SEO Score Card */}
      {seoAnalysis && (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${getSEOScoreBg(seoAnalysis.score)}`}>
                <Sparkles className={`w-6 h-6 ${getSEOScoreColor(seoAnalysis.score)}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Health Score</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {seoAnalysis.status.charAt(0).toUpperCase() + seoAnalysis.status.slice(1)}
                </p>
              </div>
            </div>
            <div className={`text-4xl font-bold ${getSEOScoreColor(seoAnalysis.score)}`}>
              {seoAnalysis.score}
              <span className="text-lg">/100</span>
            </div>
          </div>

          {seoAnalysis.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Issues Found ({seoAnalysis.issues.length})
              </h4>
              <div className="space-y-1.5">
                {seoAnalysis.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Type
                </label>
                <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg ${getTypeColor(formData.type)}`}>
                  {getTypeLabel(formData.type)}
                </span>
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
                  {formData.isActive && <CheckCircle className="w-4 h-4 text-green-500" />}
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
          </div>
        </motion.div>

        {/* SEO Metadata Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SEO Metadata</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={3}
              placeholder="120-160 characters for optimal SEO"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            />
          </div>

          <Input
            label="Meta Keywords"
            name="metaKeywords"
            value={formData.metaKeywords}
            onChange={handleChange}
            placeholder="keyword1, keyword2, keyword3"
          />
        </motion.div>

        {/* Open Graph Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Open Graph (Facebook)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="OG Title"
              name="ogTitle"
              value={formData.ogTitle}
              onChange={handleChange}
              placeholder="Title for social media shares"
            />
            <Input
              label="OG Image URL"
              name="ogImage"
              value={formData.ogImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
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
        </motion.div>

        {/* Twitter Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Twitter Card</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Twitter Title"
              name="twitterTitle"
              value={formData.twitterTitle}
              onChange={handleChange}
              placeholder="Title for Twitter shares"
            />
            <Input
              label="Twitter Image URL"
              name="twitterImage"
              value={formData.twitterImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
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
        </motion.div>

        {/* Schema JSON Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schema.org JSON-LD</h3>
          
          <textarea
            name="schemaJson"
            value={formData.schemaJson}
            onChange={handleChange}
            rows={6}
            placeholder='{"@context": "https://schema.org", "@type": "WebPage", "name": "Page Name", "description": "Page Description"}'
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Add structured data to help search engines understand your page better
          </p>
        </motion.div>

        {/* Sticky Save Button */}
        <div className="sticky bottom-6 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={<Save className="w-5 h-5" />}
            loading={saving}
            className="shadow-xl"
          >
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
}