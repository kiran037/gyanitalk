// ===================================
// FILE: lib/requests/api.ts
// ===================================

import {
  CallRequest,
  ChatRequest,
  PendingRequest,
  Group,
  AssignmentRules,
  GroupPriorities,
  AnalyticsOverview,
  GroupPerformance,
  AcceptanceRateData,
  RequestFilters,
  AssignmentResult,
  BulkAssignPayload,
  BulkAssignResult,
  Pagination,
} from "./types";

const BASE_URL = "/api/request";

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// ===================================
// CALL REQUESTS
// ===================================

export async function fetchCallRequests(
  params: RequestFilters & { page?: number; limit?: number }
): Promise<{
  data: CallRequest[];
  pagination: Pagination;
}> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, String(value));
  });

  return fetchAPI(`/call/list?${searchParams.toString()}`);
}

export async function fetchCallRequestById(id: number): Promise<{ data: CallRequest }> {
  return fetchAPI(`/call/${id}`);
}

export async function assignCallRequest(
  requestId: number,
  groupId: number
): Promise<AssignmentResult> {
  return fetchAPI(`/call/assign`, {
    method: "POST",
    body: JSON.stringify({ requestId, groupId }),
  });
}

export async function reassignCallRequest(
  requestId: number,
  groupId?: number,
  broadcast?: boolean
): Promise<AssignmentResult> {
  return fetchAPI(`/call/reassign`, {
    method: "POST",
    body: JSON.stringify({ requestId, groupId, broadcast }),
  });
}

export async function updateCallRequestStatus(
  id: number,
  callStatus: string
): Promise<{ data: CallRequest }> {
  return fetchAPI(`/call/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ callStatus }),
  });
}

export async function fetchPendingCallRequests(
  params?: { groupId?: string; page?: number; limit?: number }
): Promise<{
  data: CallRequest[];
  pagination: Pagination;
  summary: any;
}> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, String(value));
    });
  }

  return fetchAPI(`/call/pending?${searchParams.toString()}`);
}

// ===================================
// CHAT REQUESTS
// ===================================

export async function fetchChatRequests(
  params: RequestFilters & { page?: number; limit?: number }
): Promise<{
  data: ChatRequest[];
  pagination: Pagination;
}> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, String(value));
  });

  return fetchAPI(`/chat/list?${searchParams.toString()}`);
}

export async function fetchChatRequestById(id: number): Promise<{ data: ChatRequest }> {
  return fetchAPI(`/chat/${id}`);
}

export async function assignChatRequest(
  requestId: number,
  groupId: number
): Promise<AssignmentResult> {
  return fetchAPI(`/chat/assign`, {
    method: "POST",
    body: JSON.stringify({ requestId, groupId }),
  });
}

export async function reassignChatRequest(
  requestId: number,
  groupId?: number,
  broadcast?: boolean
): Promise<AssignmentResult> {
  return fetchAPI(`/chat/reassign`, {
    method: "POST",
    body: JSON.stringify({ requestId, groupId, broadcast }),
  });
}

export async function updateChatRequestStatus(
  id: number,
  chatStatus: string
): Promise<{ data: ChatRequest }> {
  return fetchAPI(`/chat/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ chatStatus }),
  });
}

export async function fetchPendingChatRequests(
  params?: { groupId?: string; page?: number; limit?: number }
): Promise<{
  data: ChatRequest[];
  pagination: Pagination;
  summary: any;
}> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, String(value));
    });
  }

  return fetchAPI(`/chat/pending?${searchParams.toString()}`);
}

// ===================================
// PENDING REQUESTS (COMBINED)
// ===================================

export async function fetchPendingRequests(
  params?: { groupId?: string; limit?: number }
): Promise<{
  data: PendingRequest[];
  summary: {
    totalPending: number;
    pendingCalls: number;
    pendingChats: number;
    expiringSoon: number;
    assigned: number;
    unassigned: number;
  };
}> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, String(value));
    });
  }

  return fetchAPI(`/pending/all?${searchParams.toString()}`);
}

export async function bulkAssignRequests(
  payload: BulkAssignPayload
): Promise<BulkAssignResult> {
  return fetchAPI(`/pending/assign-bulk`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ===================================
// GROUPS
// ===================================

export async function fetchGroups(
  includeAstrologers: boolean = false
): Promise<{ data: Group[]; total: number }> {
  const params = includeAstrologers ? "?includeAstrologers=true" : "";
  return fetchAPI(`/groups/list${params}`);
}

export async function fetchGroupAstrologers(groupId: number): Promise<{
  data: {
    groupId: bigint;
    groupName: string | null;
    totalAstrologers: number;
    astrologers: any[];
  };
}> {
  return fetchAPI(`/groups/${groupId}/astrologers`);
}

export async function fetchGroupPerformance(
  groupId: number,
  days: number = 7
): Promise<{ data: GroupPerformance }> {
  return fetchAPI(`/groups/${groupId}/performance?days=${days}`);
}

// ===================================
// SETTINGS
// ===================================

export async function fetchAssignmentRules(): Promise<{ data: AssignmentRules }> {
  return fetchAPI(`/settings/rules`);
}

export async function saveAssignmentRules(
  rules: Partial<AssignmentRules>
): Promise<{ data: AssignmentRules }> {
  return fetchAPI(`/settings/rules`, {
    method: "POST",
    body: JSON.stringify(rules),
  });
}

export async function fetchGroupPriorities(): Promise<{ data: GroupPriorities }> {
  return fetchAPI(`/settings/priorities`);
}

export async function saveGroupPriorities(
  priorities: GroupPriorities
): Promise<{ data: GroupPriorities }> {
  return fetchAPI(`/settings/priorities`, {
    method: "PATCH",
    body: JSON.stringify(priorities),
  });
}

export async function fetchTimeoutSettings(): Promise<{
  data: { expiryMinutes: number };
}> {
  return fetchAPI(`/settings/timeout`);
}

export async function saveTimeoutSettings(
  expiryMinutes: number
): Promise<{ data: { expiryMinutes: number } }> {
  return fetchAPI(`/settings/timeout`, {
    method: "PATCH",
    body: JSON.stringify({ expiryMinutes }),
  });
}

// ===================================
// ANALYTICS
// ===================================

export async function fetchAnalyticsOverview(
  days: number = 7
): Promise<{ data: AnalyticsOverview }> {
  return fetchAPI(`/analytics/overview?days=${days}`);
}

export async function fetchGroupPerformanceAnalytics(
  days: number = 7
): Promise<{ data: { period: string; groups: GroupPerformance[] } }> {
  return fetchAPI(`/analytics/group-performance?days=${days}`);
}

export async function fetchAcceptanceRate(
  days: number = 30
): Promise<{ data: AcceptanceRateData }> {
  return fetchAPI(`/analytics/acceptance-rate?days=${days}`);
}