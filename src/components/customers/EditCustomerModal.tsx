
import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { User, Phone, Mail, MapPin, Calendar } from "lucide-react";

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onSuccess: () => void;
}

export default function EditCustomerModal({ isOpen, onClose, customer, onSuccess }: EditCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name || "",
    email: customer.email || "",
    contactNo: customer.contactNo || "",
    gender: customer.gender || "",
    birthDate: customer.birthDate ? new Date(customer.birthDate).toISOString().split('T')[0] : "",
    birthTime: customer.birthTime || "",
    birthPlace: customer.birthPlace || "",
    location: customer.location || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.error || "Failed to update customer");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Customer Information" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name, Email, Phone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} required icon={<User className="w-4 h-4" />} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail className="w-4 h-4" />} />
          <Input label="Phone" name="contactNo" value={formData.contactNo} onChange={handleChange} required icon={<Phone className="w-4 h-4" />} />
        </div>

        {/* Row 2: Gender, Birth Date, Birth Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input label="Birth Date" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} icon={<Calendar className="w-4 h-4" />} />
          <Input label="Birth Time" name="birthTime" type="time" value={formData.birthTime} onChange={handleChange} icon={<Calendar className="w-4 h-4" />} />
        </div>

        {/* Row 3: Birth Place, Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Birth Place" name="birthPlace" value={formData.birthPlace} onChange={handleChange} icon={<MapPin className="w-4 h-4" />} />
          <Input label="Location" name="location" value={formData.location} onChange={handleChange} icon={<MapPin className="w-4 h-4" />} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>Update</Button>
        </div>
      </form>
    </Modal>
  );
}