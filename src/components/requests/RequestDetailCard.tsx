// ===================================
// FILE: components/requests/RequestDetailCard.tsx
// ===================================

"use client";

import { CallRequest, ChatRequest } from "@/lib/requests/types";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { formatDateTime, formatCurrency } from "@/lib/requests/utils";
import { User, Phone, Calendar, DollarSign, Clock, MessageSquare } from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";

interface RequestDetailCardProps {
  request: CallRequest | ChatRequest;
  type: "call" | "chat";
}

export function RequestDetailCard({ request, type }: RequestDetailCardProps) {
  const status = type === "call" 
    ? (request as CallRequest).callStatus 
    : (request as ChatRequest).chatStatus;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {type === "call" ? "Call" : "Chat"} Request #{request.id}
          </h3>
          <RequestStatusBadge status={status || "Pending"} />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Created</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDateTime(request.created_at)}
          </p>
        </div>
      </div>

      {/* User Info */}
      {request.user && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            User Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {request.user.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Contact</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {request.user.contactNo || "N/A"}
              </p>
            </div>
            {request.user.birthDate && (
              <div>
                <p className="text-xs text-gray-500">Birth Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDateTime(request.user.birthDate)}
                </p>
              </div>
            )}
            {request.user.birthPlace && (
              <div>
                <p className="text-xs text-gray-500">Birth Place</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.user.birthPlace}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Astrologer Info (if assigned) */}
      {request.astrologer && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Assigned Astrologer
          </h4>
          <div className="flex items-center gap-4">
            <Image
              src={avatar(request.astrologer.profileImage)}
              alt={request.astrologer.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {request.astrologer.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {request.astrologer.experienceInYears} years exp • {request.astrologer.primarySkill}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Request Details */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Request Details
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {type === "call" ? (
              <Phone className="w-4 h-4 text-gray-400" />
            ) : (
              <MessageSquare className="w-4 h-4 text-gray-400" />
            )}
            <div>
              <p className="text-xs text-gray-500">Rate</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(Number(type === "call" ? (request as CallRequest).callRate : (request as ChatRequest).chatRate) || 0)}/min
              </p>
            </div>
          </div>

          {request.totalMin && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.totalMin} min
                </p>
              </div>
            </div>
          )}

          {request.deduction !== null && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Deduction</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(request.deduction)}
                </p>
              </div>
            </div>
          )}

          {request.updated_at && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDateTime(request.updated_at)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Metadata (if exists) */}
      {request.assignmentMetadata && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Assignment Info
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Attempt:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.assignmentMetadata.attempt}
              </span>
            </div>
            {request.assignmentMetadata.assigned_group_id && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Group:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  Group {request.assignmentMetadata.assigned_group_id}
                </span>
              </div>
            )}
            {request.assignmentMetadata.previous_groups.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Previous Groups:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {request.assignmentMetadata.previous_groups.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}