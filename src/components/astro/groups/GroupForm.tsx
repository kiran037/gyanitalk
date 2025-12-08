"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  group: any | null;
  onSuccess: () => void;
}

export function GroupForm({ isOpen, onClose, group, onSuccess }: GroupFormProps) {
  const addToast = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name || "");
    } else {
      setName("");
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("error", "Error", "Group name is required");
      return;
    }

    setLoading(true);
    try {
      const url = group ? `/api/astrologer-groups/${group.id}` : "/api/astrologer-groups";
      const method = group ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", group ? "Group updated successfully" : "Group created successfully");
        onSuccess();
      } else {
        addToast("error", "Error", data.error || "Failed to save group");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to save group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={group ? "Edit Group" : "Create Group"} size="sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Group Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Premium Astrologers"
          required
        />

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} type="button" className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {group ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}