"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, MessageSquare, Phone, ShoppingBag, Wallet, Search } from "lucide-react";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { useRouter } from "next/navigation";
import { avatar } from "@/lib/images";

interface User {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  profile: string;
  gender: string;
  joinedAt: string;
  isActive: boolean;
  stats: {
    totalChats: number;
    totalCalls: number;
    totalOrders: number;
    totalSpent: number;
    walletBalance: number;
  };
}

export function UserActivityTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const res = await fetch(`/api/user-activities/list?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              User Activity List
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {total} total users
            </p>
          </div>
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, email, or phone..."
            className="w-full sm:w-80"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Wallet
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4" colSpan={6}>
                    <div className="animate-pulse flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar(user.profile)}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200/60 dark:ring-gray-700/60"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.gender || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white truncate">
                        {user.email || "No email"}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {user.contactNo || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1 text-xs">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-gray-900 dark:text-white">{user.stats.totalChats}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-gray-900 dark:text-white">{user.stats.totalCalls}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-gray-900 dark:text-white">{user.stats.totalOrders}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₹{Number(user.stats.walletBalance || 0).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Spent: ₹{Number(user.stats.totalSpent || 0).toFixed(0)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => router.push(`/user-activities/${user.id}`)}
                      ariaLabel="View Details"
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}