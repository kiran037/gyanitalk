// ===================================
// FILE: lib/requests/types.ts
// ===================================

export interface User {
  id: bigint;
  name: string | null;
  contactNo: string | null;
  email: string | null;
  birthDate: Date | null;
  birthPlace: string | null;
  gender: string | null;
}

export interface Astrologer {
  id: bigint;
  name: string;
  email: string;
  contactNo: string;
  profileImage: string | null;
  experienceInYears: number;
  primarySkill: string;
}

export interface AssignmentHistoryItem {
  group_id: number | null;
  assigned_at: string;
  timeout_at: string;
  status: "pending" | "timeout" | "accepted" | "rejected";
}

export interface AssignmentMetadata {
  assigned_group_id: number | null;
  assigned_at: string;
  attempt: number;
  previous_groups: number[];
  assignment_history: AssignmentHistoryItem[];
}

export interface CallRequest {
  id: number;
  userId: bigint;
  astrologerId: bigint | null;
  callStatus: string | null;
  totalMin: string | null;
  callRate: string | null;
  deduction: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  user?: User;
  astrologer?: Astrologer;
  assignmentMetadata?: AssignmentMetadata | null;
  timeRemaining?: number;
  assignmentTimeout?: number;
  isExpiringSoon?: boolean;
}

export interface ChatRequest {
  id: number;
  userId: bigint;
  astrologerId: bigint;
  chatStatus: string | null;
  totalMin: string | null;
  chatRate: string | null;
  deduction: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  user?: User;
  astrologer?: Astrologer;
  assignmentMetadata?: AssignmentMetadata | null;
  timeRemaining?: number;
  assignmentTimeout?: number;
  isExpiringSoon?: boolean;
}

export interface PendingRequest {
  id: number;
  type: "call" | "chat";
  userId: bigint;
  userName: string;
  userContact: string;
  status: string;
  createdAt: Date;
  assignmentMetadata?: AssignmentMetadata | null;
  timeRemaining: number;
  assignmentTimeout: number;
  isExpiringSoon: boolean;
}

export interface Group {
  id: bigint;
  name: string | null;
  created_at: Date | null;
  totalAstrologers: number;
  activeAstrologers: number;
  priority: number | null;
  timeout: number | null;
  astrologers?: Astrologer[];
}

export interface AssignmentRules {
  default_timeout: number;
  max_retries: number;
  priority_groups: number[];
  enable_auto_assign: boolean;
  enable_skill_matching: boolean;
  load_balance: boolean;
}

export interface GroupPriorities {
  [groupId: string]: {
    priority: number;
    timeout: number;
  };
}

export interface RequestTypeStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  rejected: number;
}

export interface AnalyticsOverview {
  period: string;
  summary: {
    totalRequests: number;
    totalPending: number;
    totalConfirmed: number;
    totalCompleted: number;
    totalRejected: number;
    activeAstrologers: number;
    totalGroups: number;
  };
  calls: RequestTypeStats;
  chats: RequestTypeStats;
  rates: {
    completionRate: string;
    rejectionRate: string;
    acceptanceRate: string;
  };
}

export interface GroupPerformance {
  groupId: number;
  groupName: string | null;
  assigned: number;
  accepted: number;
  completed: number;
  timeout: number;
  acceptanceRate: string;
  completionRate: string;
  timeoutRate: string;
}

export interface DailyTrend {
  date: string;
  total: number;
  accepted: number;
  completed: number;
  rejected: number;
  acceptanceRate: string;
  completionRate: string;
  rejectionRate: string;
}

export interface AcceptanceRateData {
  period: string;
  overall: {
    calls: {
      total: number;
      accepted: number;
      completed: number;
      acceptanceRate: string;
      completionRate: string;
    };
    chats: {
      total: number;
      accepted: number;
      completed: number;
      acceptanceRate: string;
      completionRate: string;
    };
  };
  dailyTrends: {
    calls: DailyTrend[];
    chats: DailyTrend[];
  };
}

export interface RequestFilters {
  status?: string;
  astrologerId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  groupId?: string;
  search?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AssignmentResult {
  success: boolean;
  message: string;
  data?: {
    requestId: number;
    groupId: number | null;
    groupName: string | null;
    assignmentMetadata: AssignmentMetadata;
    notificationsSent: number;
    notificationsFailed: number;
  };
}

export interface BulkAssignPayload {
  requests: Array<{ id: number; type: "call" | "chat" }>;
  groupId: number;
}

export interface BulkAssignResult {
  success: boolean;
  message: string;
  data: {
    groupId: number;
    groupName: string | null;
    successCount: number;
    failedCount: number;
    results: Array<{
      id: number;
      type: string;
      success: boolean;
      message?: string;
      error?: string;
    }>;
  };
}