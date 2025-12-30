import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import Link from "next/link";
import { avatar } from "@/lib/images";

interface Customer {
  id: string;
  name: string;
  contactNo: string;
  countryCode: string;
  email: string;
  gender: string;
  birthDate: Date | null;
  birthTime: string;
  joinDate: Date | null;
  walletBalance: string;
  isActive: boolean;
  isDelete: boolean;
  location: string;
  profile?: string | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function CustomersTable({
  customers,
  loading,
  pagination,
  onPageChange,
}: CustomersTableProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time || time === "N/A") return "N/A";
    return time;
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60">
            <tr>
              {["ID", "Name", "Phone", "Gender", "Birth Details", "Join Date", "Balance", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No customers found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Gender
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Birth Details
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Join Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <img
                    src={avatar(customer.profile) || "default-avatar.svg"}
                    onError={(e) => (e.currentTarget.src = "default-avatar.svg")}
                    alt={customer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {customer.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900 dark:text-white">
                  {customer.countryCode} {customer.contactNo}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.gender === "male"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      : customer.gender === "female"
                        ? "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                >
                 {customer.gender ? customer.gender.toUpperCase() : "N/A"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDate(customer.birthDate)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatTime(customer.birthTime)}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900 dark:text-white">
                  {formatDate(customer.joinDate)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    ₹{parseFloat(customer.walletBalance).toFixed(2)}
                  </span>
                  {parseFloat(customer.walletBalance) > 0 && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <Link href={`/admin/customers/${customer.id}`}>
                  <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />}>
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${pagination.currentPage === pageNum
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}