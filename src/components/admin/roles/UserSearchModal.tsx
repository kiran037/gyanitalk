import { useState } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { User, Mail, Phone, Search as SearchIcon } from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";
import AssignRolesModal from "./AssignRolesModal";

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

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserSearchModal({
  isOpen,
  onClose,
  onSuccess,
}: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/roles/users/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setSearchQuery("");
    setUsers([]);
    onSuccess();
  };

  const handleClose = () => {
    setSearchQuery("");
    setUsers([]);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Search Users to Assign Roles"
        size="md"
      >
        <div className="space-y-6">
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Search for users by name, email, or phone number to assign roles.
          </p>

          {/* Search Input */}
          <div className="space-y-3">
            <SearchInput
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                if (value.length >= 2) handleSearch();
              }}
              placeholder="Search by name, email, or phone..."
            />
            
            {searchQuery && searchQuery.length < 2 && (
              <p className="text-xs text-gray-500">
                Type at least 2 characters to search
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#FF6B35]/30 border-t-[#FF6B35] rounded-full animate-spin" />
            </div>
          )}

          {/* No Results */}
          {!loading && searchQuery.length >= 2 && users.length === 0 && (
            <div className="text-center py-8">
              <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No users found matching "{searchQuery}"
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && users.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {user.profile ? (
                        <Image
                          src={avatar(user.profile)}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.contactNo}
                        </span>
                      </div>
                      {user.currentRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.currentRoles.map((role) => (
                            <span
                              key={role.roleId}
                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                            >
                              {role.roleName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUserSelect(user)}
                  >
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Assign Roles Modal */}
      {selectedUser && (
        <AssignRolesModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={handleAssignSuccess}
        />
      )}
    </>
  );
}