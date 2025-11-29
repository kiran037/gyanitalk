import { useState, useEffect } from "react";
import { ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { avatar } from "@/lib/images";

interface Order {
  id: string;
  orderType: string | null;
  productName: string;
  productImage: string | null;
  categoryName: string;
  astrologerName: string | null;
  orderStatus: string | null;
  payableAmount: string;
  totalPayable: string;
  paymentMethod: string | null;
  createdAt: Date;
}

interface OrdersTabProps {
  customerId: string;
}

export default function OrdersTab({ customerId }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/orders?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders</h3>
        <p className="text-gray-600 dark:text-gray-400">This customer hasn't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Product</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Category</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Type</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Amount</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {order.productImage ? (
                    <img
                      src={avatar(order.productImage)}
                      alt={order.productName}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.productName}</p>
                    {order.astrologerName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.astrologerName}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">{order.categoryName}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">{order.orderType || "Product"}</span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <p className="font-bold text-gray-900 dark:text-white">₹{parseFloat(order.totalPayable).toFixed(2)}</p>
                  {order.paymentMethod && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.paymentMethod}</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus || "N/A"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
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
      )}
    </div>
  );
}