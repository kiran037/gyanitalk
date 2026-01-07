import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { Button } from "@/components/adminUI/Button";
import { User, Lock, Shield } from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";

interface Role {
  id: string;
  name: string;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  profile: string | null;
  currentRoles: Array<{
    roleId: string;
    roleName: string;
  }>;
}

interface AssignRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
}

export default function AssignRolesModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: AssignRolesModalProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const lockedRoleNames = ["astrologer", "user"];

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      // Pre-select current roles
      setSelectedRoles(user.currentRoles.map((r) => r.roleId));
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/roles");
      const data = await response.json();

      if (data.success) {
        setAllRoles(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = (roleId: string, roleName: string) => {
    // Prevent toggling locked roles
    if (lockedRoleNames.includes(roleName.toLowerCase())) {
      return;
    }

    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/roles/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          roleIds: selectedRoles,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        alert(data.error || "Failed to assign roles");
      }
    } catch (error) {
      console.error("Failed to assign roles:", error);
      alert("Failed to assign roles");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Roles"
      size="md"
    >
      <div className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            {user.profile ? (
              <Image
                src={avatar(user.profile)}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white">
              {user.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <Lock className="w-3 h-3 inline mr-1" />
            <strong>Astrologer</strong> and <strong>User</strong> roles are locked and managed from their respective pages.
          </p>
        </div>

        {/* Roles Selection */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Select Roles
          </h3>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allRoles.map((role) => {
                const isLocked = lockedRoleNames.includes(role.name.toLowerCase());
                const isChecked = selectedRoles.includes(role.id);

                return (
                  <label
                    key={role.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isLocked
                        ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
                        : isChecked
                        ? "bg-[#FF6B35]/10 border-[#FF6B35] cursor-pointer"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]/50 cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleRole(role.id, role.name)}
                      disabled={isLocked}
                      className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                    />

                    <div className="flex items-center gap-2 flex-1">
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Shield className="w-4 h-4 text-[#FF6B35]" />
                      )}
                      <span className={`text-sm font-medium ${
                        isLocked ? "text-gray-500" : "text-gray-900 dark:text-white"
                      }`}>
                        {role.name}
                      </span>
                    </div>

                    {isLocked && (
                      <span className="text-xs text-gray-400 uppercase">
                        System
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">
              {selectedRoles.length}
            </strong>{" "}
            {selectedRoles.length === 1 ? "role" : "roles"} will be assigned to this user
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1"
            loading={submitting}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}