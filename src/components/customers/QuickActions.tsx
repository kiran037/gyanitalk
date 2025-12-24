// components/customerscompo/QuickActions.tsx
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/adminUI/Button";

interface QuickActionsProps {
  customerId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuickActions({ onEdit, onDelete }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        icon={<Edit className="w-4 h-4" />}
      >
        Edit
      </Button>

      <Button
        variant="danger"
        size="sm"
        onClick={onDelete}
        icon={<Trash2 className="w-4 h-4" />}
      >
        Delete
      </Button>
    </div>
  );
}