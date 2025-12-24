"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Wallet,
  MessageSquare,
  Phone,
  ShoppingBag,
  Users,
  Bell,
  Gift,
} from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import CustomerHeader from "@/components/customers/CustomerHeader";
import CustomerInfo from "@/components/customers/CustomerInfo";
import QuickActions from "@/components/customers/QuickActions";
import TabNavigation from "@/components/customers/TabNavigation";
import ChatHistoryTab from "@/components/customers/tabs/ChatHistoryTab";
import CallHistoryTab from "@/components/customers/tabs/CallHistoryTab";
import OrdersTab from "@/components/customers/tabs/OrdersTab";
import TransactionsTab from "@/components/customers/tabs/TransactionsTab";
import FollowingTab from "@/components/customers/tabs/FollowingTab";
import NotificationsTab from "@/components/customers/tabs/NotificationsTab";
import GiftsTab from "@/components/customers/tabs/GiftsTab";
import EditCustomerModal from "@/components/customers/EditCustomerModal";

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  countryCode: string;
  profile: string | null;
  birthDate: Date | null;
  birthTime: string;
  birthPlace: string;
  location: string;
  gender: string;
  referCode: string | null;
  isActive: boolean;
  isDelete: boolean;
  createdAt: Date;
  lastActive: Date;
  walletBalance: string;
  stats: {
    totalChats: number;
    totalCalls: number;
    totalOrders: number;
    totalReviews: number;
    totalFollowing: number;
    totalSpent: string;
  };
}

type TabType = "chats" | "calls" | "orders" | "transactions" | "following" | "notifications" | "gifts";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("chats");
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      const data = await response.json();

      if (data.success) {
        setCustomer(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Customer deleted successfully");
        router.push("/customers");
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  const tabs = [
    { id: "chats", label: "Chat History", icon: MessageSquare, count: customer?.stats.totalChats },
    { id: "calls", label: "Call History", icon: Phone, count: customer?.stats.totalCalls },
    { id: "orders", label: "Orders", icon: ShoppingBag, count: customer?.stats.totalOrders },
    { id: "transactions", label: "Transactions", icon: Wallet },
    { id: "following", label: "Following", icon: Users, count: customer?.stats.totalFollowing },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "gifts", label: "Gifts", icon: Gift },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 to-amber-50/30 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 to-amber-50/30 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Customer Not Found</h2>
          <Button
            variant="primary"
            onClick={() => router.push("/customers")}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Action Bar */}
<div className="flex items-center justify-between gap-4">
  {/* Back Button */}
  <Button
    variant="ghost"
    onClick={() => router.push("/customers")}
    icon={<ArrowLeft className="w-4 h-4" />}
    size="sm"
  >
    Back to Customers
  </Button>

  {/* Quick Actions */}
  <QuickActions
    customerId={customer.id}
    onEdit={() => setShowEditModal(true)}
    onDelete={handleDelete}
  />
</div>

{/* Customer Header */}
<CustomerHeader customer={customer} />

        {/* Customer Info */}
        <CustomerInfo customer={customer} />

        {/* Tabs Navigation */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
        />

        {/* Tab Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg overflow-hidden">
          {activeTab === "chats" && <ChatHistoryTab customerId={customer.id} />}
          {activeTab === "calls" && <CallHistoryTab customerId={customer.id} />}
          {activeTab === "orders" && <OrdersTab customerId={customer.id} />}
          {activeTab === "transactions" && <TransactionsTab customerId={customer.id} />}
          {activeTab === "following" && <FollowingTab customerId={customer.id} />}
          {activeTab === "notifications" && <NotificationsTab customerId={customer.id} />}
          {activeTab === "gifts" && <GiftsTab customerId={customer.id} />}
        </div>
      </div>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        customer={customer}
        onSuccess={fetchCustomerDetails}
      />
    </div>
  );
}