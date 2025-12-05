// app/earnings/astrologers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Wallet, ArrowRight, IndianRupee } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { useRouter } from "next/navigation";
import { avatar } from "@/lib/images";

interface Astrologer {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  profileImage: string | null;
  currentBalance?: number;
  totalEarnings?: number;
}

export default function AstrologersListPage() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const addToast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAstrologers();
  }, [search, pagination.page]);

  const fetchAstrologers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (search) params.append("search", search);

      const response = await fetch(`/api/landing/astro?${params}`);
      const data = await response.json();

      if (data.data) {
        setAstrologers(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }));
      }
    } catch (error) {
      console.error("Failed to fetch astrologers:", error);
      addToast("error", "Error", "Failed to fetch astrologers");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBalance = (astrologerId: string) => {
    router.push(`/earnings/astrologer/${astrologerId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
      <PageHeader
        title="Astrologer Balances"
        subtitle="View and manage astrologer wallet balances"
        badge={{ text: "WALLETS", variant: "green" }}
      />

      {/* Search */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search astrologers by name, email..."
        />
      </div>

      {/* Astrologers Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : astrologers.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Astrologers Found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Try adjusting your search query
            </p>
          </div>
        ) : (
          astrologers.map((astrologer) => (
            <motion.div
              key={astrologer.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              {/* Profile Section */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
                    {astrologer.profileImage ? (
                      <img
                        src={avatar(astrologer.profileImage)}
                        alt={astrologer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-orange-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <IndianRupee className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-1">
                    {astrologer.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {astrologer.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {astrologer.contactNo}
                  </p>
                </div>
              </div>

              {/* Info Card */}
              <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Wallet Management
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 pl-10">
                  View transactions, earnings & withdrawals
                </p>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                onClick={() => handleViewBalance(astrologer.id)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium shadow-sm"
              >
                View Balance Details
              </Button>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="px-6"
          >
            Previous
          </Button>
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            className="px-6"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}