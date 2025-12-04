import { useState, useEffect } from "react";
import { Search, Wallet, User, Phone, Mail, DollarSign } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { Modal } from "@/components/adminUI/Modal";
import { Input } from "@/components/adminUI/Input";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  countryCode: string;
  currentBalance: string;
}

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMoneyModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMoneyModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch && debouncedSearch.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  const searchUsers = async () => {
    setSearching(true);
    try {
      const response = await fetch(
        `/api/customers?searchForWallet=true&search=${encodeURIComponent(
          debouncedSearch
        )}`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMoney = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      alert("Please select a user and enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${selectedUser.id}/wallet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          reason: "Admin credit",
          adminId: 1, // TODO: Get from session
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        onSuccess();
        handleClose();
      } else {
        alert(data.error || "Failed to add money");
      }
    } catch (error) {
      console.error("Error adding money:", error);
      alert("Failed to add money");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setAmount("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Money to Wallet">
      <div className="space-y-4">
        {!selectedUser ? (
          <>
            {/* Search Input */}
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or email..."
                icon={<Search className="w-4 h-4" />}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.countryCode} {user.contactNo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Balance
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ₹{parseFloat(user.currentBalance).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 &&
              !searching &&
              searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              )}
          </>
        ) : (
          <>
            {/* Selected User Card */}
            <div className="p-4 bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Selected Customer
                </h4>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium"
                >
                  Change
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </p>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Phone className="w-3 h-3" />
                      <span>
                        {selectedUser.countryCode} {selectedUser.contactNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Wallet className="w-3 h-3" />
                      <span>
                        Current Balance: ₹
                        {parseFloat(selectedUser.currentBalance).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <Input
              label="Amount to Add"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              required
              icon={<DollarSign className="w-4 h-4" />}
            />

            {/* Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-xs text-green-800 dark:text-green-400 mb-1">
                  New Balance Preview
                </p>
                <p className="text-lg font-bold text-green-900 dark:text-green-300">
                  ₹
                  {(
                    parseFloat(selectedUser.currentBalance) + parseFloat(amount)
                  ).toFixed(2)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddMoney}
                className="flex-1"
                loading={loading}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Add ₹{amount || "0"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}