// app/admin/astro/page.tsx - Updated with Add New button
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { 
  Star, Phone, MessageSquare, Video, Eye, Filter, 
  Download, RefreshCw, Users, Verified, Plus
} from "lucide-react";
import { AstrologerCard } from "@/components/astro/AstrologerCard";
import { AstrologerFilters } from "@/components/astro/AstrologerFilters";
import { motion } from "framer-motion";

interface Astrologer {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  profileImage: string | null;
  isVerified: boolean;
  isActive: boolean;
  chatStatus: string | null;
  callStatus: string | null;
  isLiveOff: number;
  charge: number;
  videoCallRate: number | null;
  experienceInYears: number;
  primarySkill: string | null;
  allSkill: string | null;
  languageKnown: string | null;
  totalOrder: number | null;
  followerCount: number;
  walletBalance: string;
  created_at: string;
  users: {
    name: string | null;
    email: string | null;
    contactNo: string | null;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  totalVerified: number;
  totalActive: number;
  totalOnline: number;
  totalCallOnline: number;
}

export default function AstrologersPage() {
  const router = useRouter();
  const addToast = useToast();
  
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalVerified: 0,
    totalActive: 0,
    totalOnline: 0,
    totalCallOnline: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [isVerified, setIsVerified] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("");
  const [skill, setSkill] = useState("");
  const [chatStatus, setChatStatus] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAstrologers();
  }, [pagination.page, isVerified, isActive, skill, chatStatus, callStatus]);

  const fetchAstrologers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append("search", search);
      if (isVerified) params.append("isVerified", isVerified);
      if (isActive) params.append("isActive", isActive);
      if (skill) params.append("skill", skill);
      if (chatStatus) params.append("chatStatus", chatStatus);
      if (callStatus) params.append("callStatus", callStatus);

      const response = await fetch(`/api/astrologers?${params}`);
      const data = await response.json();

      if (data.success) {
        setAstrologers(data.data);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        addToast("error", "Error", data.error || "Failed to fetch astrologers");
      }
    } catch (error) {
      console.error("Error fetching astrologers:", error);
      addToast("error", "Error", "Failed to fetch astrologers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchAstrologers();
  };

  const handleToggleStatus = async (
    id: string,
    field: string,
    value: boolean | string | number
  ) => {
    try {
      const response = await fetch(`/api/astrologers/${id}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", `${field} updated successfully`);
        fetchAstrologers();
      } else {
        addToast("error", "Error", data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      addToast("error", "Error", "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/astrologers/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Astrologer deleted successfully");
        fetchAstrologers();
      } else {
        addToast("error", "Error", data.error || "Failed to delete astrologer");
      }
    } catch (error) {
      console.error("Error deleting astrologer:", error);
      addToast("error", "Error", "Failed to delete astrologer");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setIsVerified("");
    setIsActive("");
    setSkill("");
    setChatStatus("");
    setCallStatus("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="w-full mx-auto relative z-10">
        {/* Header */}
        <PageHeader
          title="Astrologers"
          subtitle="Manage all astrologers, their status, and services"
          badge={{ text: "MANAGEMENT", variant: "orange" }}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => router.push("/admin/astro/new")}
              >
                Add New
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={fetchAstrologers}
              />
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            {
              label: "Total Astrologers",
              value: pagination.total,
              icon: Users,
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Verified",
              value: stats.totalVerified,
              icon: Verified,
              color: "from-green-500 to-green-600",
            },
            {
              label: "Online",
              value: stats.totalOnline,
              icon: MessageSquare,
              color: "from-[#FF6B35] to-[#FFB347]",
            },
            {
              label: "Active",
              value: stats.totalActive,
              icon: Star,
              color: "from-purple-500 to-purple-600",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="mt-6 space-y-4">
          <div className="flex gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, email, or contact..."
              className="flex-1"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {showFilters && (
            <AstrologerFilters
              isVerified={isVerified}
              setIsVerified={setIsVerified}
              isActive={isActive}
              setIsActive={setIsActive}
              skill={skill}
              setSkill={setSkill}
              chatStatus={chatStatus}
              setChatStatus={setChatStatus}
              callStatus={callStatus}
              setCallStatus={setCallStatus}
              onClear={clearFilters}
            />
          )}
        </div>

        {/* Astrologers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : astrologers.length === 0 ? (
          <motion.div
            className="text-center py-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl mt-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Astrologers Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push("/admin/astro/new")}
            >
              Add First Astrologer
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {astrologers.map((astrologer, index) => (
              <AstrologerCard
                key={astrologer.id}
                astrologer={astrologer}
                index={index}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onView={() => router.push(`/admin/astro/${astrologer.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "primary" : "outline"}
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: pageNum }))
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}