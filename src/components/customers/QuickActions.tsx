// components/customerscompo/QuickActions.tsx
import { Edit, Trash2, DollarSign, Bell } from "lucide-react";
import { Button } from "@/components/adminUI/Button";

interface QuickActionsProps {
  customerId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuickActions({ customerId, onEdit, onDelete }: QuickActionsProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Actions:</span>
        <Button variant="outline" size="sm" onClick={onEdit} icon={<Edit className="w-4 h-4" />}>
          Edit Info
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete} icon={<Trash2 className="w-4 h-4" />}>
          Delete Customer
        </Button>
      </div>
    </div>
  );
}