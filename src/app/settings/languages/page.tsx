"use client";

import { useState, useEffect } from "react";
import { Plus, Languages as LanguagesIcon, Globe } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { SettingsTable } from "@/components/settings/SettingsTable";
import { useToast } from "@/components/Toast/ToastProvider";
import { motion } from "framer-motion";

interface Language {
  id: string;
  languageName: string;
  languageCode: string | null;
  language_sign: string | null;
}

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [formData, setFormData] = useState({
    languageName: "",
    languageCode: "",
    language_sign: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch("/api/settings/languages");
      const data = await response.json();
      if (data.success) {
        setLanguages(data.data);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch languages");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = selectedLanguage
        ? `/api/settings/languages/${selectedLanguage.id}`
        : "/api/settings/languages";

      const response = await fetch(url, {
        method: selectedLanguage ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        fetchLanguages();
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

  const handleDelete = async () => {
    if (!selectedLanguage) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/settings/languages/${selectedLanguage.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Deleted", "Language deleted successfully");
        fetchLanguages();
        setIsDeleteModalOpen(false);
        setSelectedLanguage(null);
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (language: Language) => {
    setSelectedLanguage(language);
    setFormData({
      languageName: language.languageName,
      languageCode: language.languageCode || "",
      language_sign: language.language_sign || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLanguage(null);
    setFormData({ languageName: "", languageCode: "", language_sign: "" });
  };

  const filteredLanguages = languages.filter(
    (l) =>
      l.languageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.languageCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "language_sign",
      label: "Flag",
      render: (item: Language) => (
        <span className="text-2xl">{item.language_sign || "🌐"}</span>
      ),
    },
    { key: "languageName", label: "Language" },
    {
      key: "languageCode",
      label: "Code",
      render: (item: Language) => (
        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
          {item.languageCode || "—"}
        </code>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Languages"
        subtitle="Manage supported languages for the platform"
        badge={{ text: "Localization", variant: "green" }}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Language
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search languages..."
          />
        </div>
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Languages</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{languages.length}</div>
        </motion.div>
      </div>

      <SettingsTable
        data={filteredLanguages}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(language) => {
          setSelectedLanguage(language);
          setIsDeleteModalOpen(true);
        }}
        loading={loading}
        emptyMessage="No languages found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedLanguage ? "Edit Language" : "Add Language"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Language Name"
            value={formData.languageName}
            onChange={(e) => setFormData({ ...formData, languageName: e.target.value })}
            placeholder="e.g., Hindi"
            required
            icon={<LanguagesIcon className="w-4 h-4" />}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Language Code"
              value={formData.languageCode}
              onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
              placeholder="e.g., hi"
              required
              icon={<Globe className="w-4 h-4" />}
            />
            <Input
              label="Flag Emoji"
              value={formData.language_sign}
              onChange={(e) => setFormData({ ...formData, language_sign: e.target.value })}
              placeholder="e.g., 🇮🇳"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              {selectedLanguage ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Language"
        message={`Are you sure you want to delete ${selectedLanguage?.languageName}?`}
        confirmText="Delete"
        type="danger"
        loading={submitting}
      />
    </div>
  );
}