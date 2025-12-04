// components/supports/ContactDetailModal.tsx
import { Modal } from "../adminUI/Modal";
import { Mail, User, Calendar, Clock, MessageSquare } from "lucide-react";

interface Contact {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_message: string;
  created_at: string;
  updated_at: string;
}

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export function ContactDetailModal({
  isOpen,
  onClose,
  contact,
}: ContactDetailModalProps) {
  if (!contact) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Details" size="lg">
      <div className="space-y-6">
        {/* Contact Info */}
        <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 dark:from-[#FF6B35]/5 dark:to-[#FFB347]/5 rounded-xl p-6 border border-[#FF6B35]/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center text-white text-2xl font-bold">
              {contact.contact_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {contact.contact_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contact ID: #{contact.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                  {contact.contact_email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Submitted</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(contact.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-[#FF6B35]" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Message</h4>
          </div>
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
            <p className="text-sm text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
              {contact.contact_message}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Last updated: {formatDate(contact.updated_at)}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
          <a
            href={`mailto:${contact.contact_email}`}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all text-center"
          >
            Reply via Email
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}