import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";

export default function UserOrderDetails({ details }: { details: any }) {
    const [selectedStatus, setSelectedStatus] = useState("All");

    const filteredOrders =
        selectedStatus === "All"
            ? details
            : details.filter((o: any) => o.orderStatus === selectedStatus);

    const statusOptions = ["All", "Pending", "Confirmed", "Rejected", "Accepted"];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-semibold text-teal-600">{filteredOrders.length}</span>{" "}
                    {selectedStatus === "All" ? "orders" : `"${selectedStatus}" orders`}
                </div>

                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order: any) => {
                    const product = order.product || {};
                    const address = order.order_address || {};
                    const createdAt = format(new Date(order.created_at), "dd MMM yyyy, hh:mm a");

                    return (
                        <div
                            key={order.id}
                            className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5 flex flex-col gap-4 border border-gray-200 dark:border-gray-700"
                        >
                            {/* Product image + title */}
                            <div className="flex items-center gap-4">
                                <div className="w-[60px] h-[60px] rounded overflow-hidden border border-gray-300 dark:border-gray-600">
                                    <Image
                                        src={
                                            product?.productImage
                                                ? `${process.env.NEXT_PUBLIC_BASEURL}/${product.productImage}`
                                                : "https://gyanitalk.com/build/assets/images/person.png"
                                        }
                                        alt="Product"
                                        width={60}
                                        height={60}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{product.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{createdAt}</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span
                                        className={`font-medium ${order.orderStatus === "Confirmed"
                                                ? "text-green-600"
                                                : order.orderStatus === "Rejected"
                                                    ? "text-red-500"
                                                    : "text-yellow-500"
                                            }`}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Amount:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        ₹{order.totalPayable}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Payment:</span>
                                    <span>{order.paymentMethod || "-"}</span>
                                </div>

                                {order.couponCode && (
                                    <div className="flex justify-between">
                                        <span>Coupon:</span>
                                        <span className="text-blue-600 font-medium">{order.couponCode}</span>
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            <div className="pt-2 border-t border-dashed border-gray-300 dark:border-gray-600 text-sm">
                                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-1">Delivery Address</h4>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {address.name}, {address.flatNo}, {address.locality}, {address.landmark}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {address.city}, {address.state}, {address.country} - {address.pincode}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {address.countryCode} {address.phoneNumber}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
