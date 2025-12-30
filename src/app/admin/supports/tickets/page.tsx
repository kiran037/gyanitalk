// app/supports/tickets/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { TicketsTable } from "@/components/supports/TicketsTable";
import { TicketDetailModal } from "@/components/supports/TicketDetailModal";
import { CreateTicketModal } from "@/components/supports/CreateTicketModal";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { Plus, Ticket, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { TicketData } from "@/types/support";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Category {
  id: string;
  name: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Modal states
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, [currentPage, selectedStatus, selectedCategory, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/support/faq/categories?limit=100");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy,
        sortOrder,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedStatus) params.append("status", selectedStatus);
      if (selectedCategory) params.append("helpSupportId", selectedCategory);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/support/tickets?${params}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTickets();
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDetails = (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setShowDeleteModal(true);
  };

  const handleTicketCreated = () => {
    setShowCreateModal(false);
    fetchTickets();
  };

  const handleStatusUpdate = () => {
    fetchTickets();
    if (selectedTicket) {
      // Refresh the selected ticket details
      fetch(`/api/support/tickets/${selectedTicket.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSelectedTicket(data.data);
          }
        });
    }
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Awaiting Response", label: "Awaiting Response" },
    { value: "Resolved", label: "Resolved" },
    { value: "Closed", label: "Closed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            title="Tickets Management"
            subtitle="Track and manage customer support tickets"
            badge={{ text: "SUPPORT", variant: "orange" }}
          />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {[
            { icon: Ticket, label: "Total", value: pagination?.total || 0, color: "blue" },
            { icon: Clock, label: "Open", value: "24", color: "orange" },
            { icon: AlertCircle, label: "In Progress", value: "12", color: "purple" },
            { icon: CheckCircle, label: "Resolved", value: "156", color: "green" },
            { icon: XCircle, label: "Closed", value: "89", color: "gray" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by ticket number, subject..."
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            />

            <Button variant="primary" onClick={handleSearch} className="w-full">
              Search
            </Button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <TicketsTable
            tickets={tickets}
            loading={loading}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteClick}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      </div>

      {/* Modals */}
      <TicketDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onStatusUpdate={handleStatusUpdate}
      />

      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleTicketCreated}
        categories={categories}
      />

      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTicket(null);
        }}
        onConfirm={handleDelete}
        title="Delete Ticket"
        message={`Are you sure you want to delete ticket "${selectedTicket?.ticketNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}