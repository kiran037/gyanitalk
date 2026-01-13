///Users/xeoren/Desktop/gyanitallk-admin/src/components/astro/groups/AstrologerSearchModal.tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { Search, X } from "lucide-react";
import { avatar } from "@/lib/images";

interface AstrologerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (astrologer: any) => void;
  excludeIds?: string[];
}

export function AstrologerSearchModal({
  isOpen,
  onClose,
  onSelect,
  excludeIds = [],
}: AstrologerSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/astrologers?search=${searchQuery}&limit=20`);
      const data = await response.json();

      if (data.success) {
        const filtered = data.data.filter(
          (a: any) => !excludeIds.includes(a.id.toString())
        );
        setAstrologers(filtered);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Astrologers" size="md">
      <div className="space-y-4">
        <div className="flex gap-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search astrologers..."
            className="flex-1"
          />
          <Button
            icon={<Search className="w-4 h-4" />}
            onClick={handleSearch}
            loading={loading}
          >
            Search
          </Button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {astrologers.map((astrologer) => (
            <div
              key={astrologer.id}
              className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => {
                onSelect(astrologer);
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatar(astrologer.profileImage)}
                  alt={astrologer.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {astrologer.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {astrologer.email}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}