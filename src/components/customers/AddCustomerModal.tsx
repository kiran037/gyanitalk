import { useState } from "react";
import { X, User, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactNo: "",
    countryCode: "+91",
    email: "",
    gender: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setFormData({
          name: "",
          contactNo: "",
          countryCode: "+91",
          email: "",
          gender: "",
          birthDate: "",
          birthTime: "",
          birthPlace: "",
        });
      } else {
        alert(data.error || "Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Customer">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
          required
          icon={<User className="w-4 h-4" />}
        />

        {/* Phone */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code
            </label>
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
            </select>
          </div>
          <div className="col-span-2">
            <Input
              label="Phone Number"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="9876543210"
              required
              icon={<Phone className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Email */}
        <Input
          label="Email (Optional)"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="customer@example.com"
          icon={<Mail className="w-4 h-4" />}
        />

        {/* Gender */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gender (Optional)
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Birth Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Birth Date (Optional)"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            icon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Birth Time (Optional)"
            name="birthTime"
            type="time"
            value={formData.birthTime}
            onChange={handleChange}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Birth Place */}
        <Input
          label="Birth Place (Optional)"
          name="birthPlace"
          value={formData.birthPlace}
          onChange={handleChange}
          placeholder="City, State"
          icon={<MapPin className="w-4 h-4" />}
        />

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
          >
            Add Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}