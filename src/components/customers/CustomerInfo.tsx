// components/customerscompo/CustomerInfo.tsx
import { Mail, Phone, MapPin, Calendar, User as UserIcon, Code } from "lucide-react";

interface CustomerInfoProps {
  customer: {
    contactNo: string;
    countryCode: string;
    email: string;
    gender: string;
    birthDate: Date | null;
    birthTime: string;
    birthPlace: string;
    location: string;
    referCode: string | null;
  };
}

export default function CustomerInfo({ customer }: CustomerInfoProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const infoItems = [
    { icon: Phone, label: "Phone", value: `${customer.countryCode} ${customer.contactNo}` },
    { icon: Mail, label: "Email", value: customer.email },
    { icon: UserIcon, label: "Gender", value: customer.gender || "N/A" },
    { icon: Calendar, label: "Birth Date", value: formatDate(customer.birthDate) },
    { icon: Calendar, label: "Birth Time", value: customer.birthTime || "N/A" },
    { icon: MapPin, label: "Birth Place", value: customer.birthPlace || "N/A" },
    { icon: MapPin, label: "Location", value: customer.location || "N/A" },
    { icon: Code, label: "Referral Code", value: customer.referCode || "N/A" },
  ];

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Customer Information</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {infoItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl">
            <item.icon className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}