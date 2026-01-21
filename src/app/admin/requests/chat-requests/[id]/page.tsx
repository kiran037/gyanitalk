// ===================================
// FILE: app/admin/requests/chat-requests/[id]/page.tsx
// ===================================

"use client";

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { RequestDetailCard } from "@/components/requests/RequestDetailCard";
import { AssignmentHistoryTimeline } from "@/components/requests/AssignmentHistoryTimeline";
import { AssignGroupModal } from "@/components/requests/AssignGroupModal";
import { useRequestDetails } from "@/lib/requests/hooks";
import { ChatRequest } from "@/lib/requests/types";
import { ArrowLeft, UserPlus, Repeat } from "lucide-react";
import { useState } from "react";

export default function ChatRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = parseInt(params.id as string);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [isReassign, setIsReassign] = useState(false);

  const { data: request, loading } = useRequestDetails(requestId, "chat");

  const handleAssign = () => {
    setIsReassign(false);
    setAssignModalOpen(true);
  };

  const handleReassign = () => {
    setIsReassign(true);
    setAssignModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Request not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/requests/chat-requests")}
          className="mt-4"
        >
          Back to Chat Requests
        </Button>
      </div>
    );
  }

  // Type guard - we know it's a ChatRequest because we passed "chat" to useRequestDetails
  const chatRequest = request as ChatRequest;
  const isPending = chatRequest.chatStatus === "Pending";

  return (
    <div className="space-y-6 p-10">
      {/* Header */}
      <PageHeader
        title={`Chat Request #${requestId}`}
        subtitle={`Status: ${chatRequest.chatStatus || "Pending"}`}
        badge={{ text: "Chat", variant: "green" }}
        leftActions={
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/requests/chat-requests")}
            icon={<ArrowLeft className="w-4 h-4" />}
            ariaLabel="Back to chat requests"
          />
        }
        actions={
          isPending && (
            <>
              <Button
                variant="outline"
                onClick={handleReassign}
                icon={<Repeat className="w-4 h-4" />}
              >
                Reassign
              </Button>
              <Button
                variant="primary"
                onClick={handleAssign}
                icon={<UserPlus className="w-4 h-4" />}
              >
                Assign to Group
              </Button>
            </>
          )
        }
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <RequestDetailCard request={chatRequest} type="chat" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment History */}
          {chatRequest.assignmentMetadata?.assignment_history && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Assignment History
              </h3>
              <AssignmentHistoryTimeline
                history={chatRequest.assignmentMetadata.assignment_history}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {isPending && (
                <>
                  <Button
                    variant="primary"
                    onClick={handleAssign}
                    className="w-full"
                    icon={<UserPlus className="w-4 h-4" />}
                  >
                    Assign to Group
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReassign}
                    className="w-full"
                    icon={<Repeat className="w-4 h-4" />}
                  >
                    Reassign
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/admin/requests/chat-requests")}
                className="w-full"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModalOpen && (
        <AssignGroupModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          requestId={requestId}
          requestType="chat"
          currentGroup={chatRequest.assignmentMetadata?.assigned_group_id || undefined}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}