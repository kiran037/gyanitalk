// app/astro/block-astro/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Eye, Shield, Users, TrendingUp, Calendar, Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";
import Link from "next/link";

interface BlockedAstrologer {
  id: number;
  astrologerId: string;
  userId: string;
  reason: string;
  created_at: string;
  astrologer: {
    id: string;
    name: string;
    email: string;
    contactNo: string;
    profileImage: string | null;
    primarySkill: string;
    experienceInYears: number;
    charge: number;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    contactNo: string | null;
    profile: string | null;
  } | null;
}

interface Statistics {
  summary: {
    totalBlocks: number;
    recentBlocks: number;
    daysAnalyzed: number;
  };
  mostBlockedAstrologers: Array<{
    astrologer: any;
    blockCount: number;
  }>;
  topBlockingUsers: Array<{
    user: any;
    blockCount: number;
  }>;
  blocksOverTime: Array<{
    date: string;
    count: number;
  }>;
  topReasons: Array<{
    word: string;
    count: number;
  }>;
}

export default function BlockedAstrologersPage() {
  const [blocks, setBlocks] = useState<BlockedAstrologer[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAstrologer, setFilterAstrologer] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockedAstrologer | null>(null);
  const [unblockLoading, setUnblockLoading] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    fetchBlocks();
    fetchStatistics();
  }, [currentPage]);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(filterAstrologer && { astrologerId: filterAstrologer }),
        ...(filterUser && { userId: filterUser }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/astrologers/block-astro?${params}`);
      const data = await response.json();

      if (data.success) {
        setBlocks(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch blocked astrologers");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch("/api/astrologers/block-astro/stats?days=30");
      const data = await response.json();

      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBlocks();
  };

  const handleUnblock = async () => {
    if (!selectedBlock) return;
    setUnblockLoading(true);
    try {
      const response = await fetch(`/api/astrologers/block-astro?id=${selectedBlock.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Astrologer unblocked successfully");
        setShowUnblockModal(false);
        fetchBlocks();
        fetchStatistics();
      } else {
        addToast("error", "Error", data.error);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to unblock astrologer");
    } finally {
      setUnblockLoading(false);
    }
  };

  const openUnblockModal = (block: BlockedAstrologer) => {
    setSelectedBlock(block);
    setShowUnblockModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Blocked Astrologers"
          subtitle="View and manage blocked astrologer relationships"
          badge={{ text: "BLOCKS", variant: "blue" }}
        />

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Blocks</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics.summary.totalBlocks}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Recent (30d)</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics.summary.recentBlocks}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Most Blocked</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {statistics.mostBlockedAstrologers[0]?.astrologer?.name || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Common Reason</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {statistics.topReasons[0]?.word || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, reason..."
              className="lg:col-span-2"
            />
            <Button onClick={handleSearch} icon={<SearchIcon className="w-4 h-4" />}>
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Blocks List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : blocks.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No blocked astrologers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Astrologer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((block) => (
                    <tr
                      key={block.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatar(block.astrologer?.profileImage)}
                            alt={block.astrologer?.name || "Astrologer"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {block.astrologer?.name || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatar(block.user?.profile)}
                            alt={block.user?.name || "User"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {block.user?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">{block.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">
                          {block.reason}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{formatDate(block.created_at)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/astro/block-astro/${block.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Eye className="w-4 h-4" />}
                              ariaLabel="View Details"
                            />
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUnblockModal(block)}
                          >
                            Unblock
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Top Blocked Astrologers */}
        {statistics && statistics.mostBlockedAstrologers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Most Blocked Astrologers
            </h3>
            <div className="space-y-3">
              {statistics.mostBlockedAstrologers.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.astrologer?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">{item.astrologer?.email}</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {item.blockCount} blocks
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unblock Modal */}
      <ActionModal
        isOpen={showUnblockModal}
        onClose={() => setShowUnblockModal(false)}
        onConfirm={handleUnblock}
        title="Unblock Astrologer"
        message={`Are you sure you want to unblock ${selectedBlock?.astrologer?.name} for ${selectedBlock?.user?.name}?`}
        confirmText="Unblock"
        type="warning"
        loading={unblockLoading}
      />
    </div>
  );
}