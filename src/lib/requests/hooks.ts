// ===================================
// FILE: lib/requests/hooks.ts
// ===================================

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCallRequests,
  fetchChatRequests,
  fetchPendingRequests,
  fetchCallRequestById,
  fetchChatRequestById,
  fetchGroups,
  fetchAnalyticsOverview,
  fetchGroupPerformanceAnalytics,
  fetchAcceptanceRate,
  fetchAssignmentRules,
  fetchGroupPriorities,
  fetchTimeoutSettings,
  assignCallRequest,
  reassignCallRequest,
  assignChatRequest,
  reassignChatRequest,
  bulkAssignRequests,
  saveAssignmentRules,
  saveGroupPriorities,
  saveTimeoutSettings,
} from "./api";
import {
  CallRequest,
  ChatRequest,
  PendingRequest,
  Group,
  AnalyticsOverview,
  GroupPerformance,
  AcceptanceRateData,
  AssignmentRules,
  GroupPriorities,
  RequestFilters,
  BulkAssignPayload,
  Pagination,
} from "./types";

// ===================================
// FETCH HOOKS
// ===================================

export function useCallRequests(filters: RequestFilters & { page?: number; limit?: number }) {
  const [data, setData] = useState<CallRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchCallRequests(filters);
        if (!cancelled) {
          setData(response.data);
          setPagination(response.pagination);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);

  return { data, pagination, loading, error, refetch: () => {} };
}

export function useChatRequests(filters: RequestFilters & { page?: number; limit?: number }) {
  const [data, setData] = useState<ChatRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchChatRequests(filters);
        if (!cancelled) {
          setData(response.data);
          setPagination(response.pagination);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);

  return { data, pagination, loading, error };
}

export function usePendingRequests(refreshInterval?: number) {
  const [data, setData] = useState<PendingRequest[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetchPendingRequests();
      setData(response.data);
      setSummary(response.summary);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, summary, loading, error, refetch: fetchData };
}

export function useRequestDetails(id: number, type: "call" | "chat") {
  const [data, setData] = useState<CallRequest | ChatRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response =
          type === "call"
            ? await fetchCallRequestById(id)
            : await fetchChatRequestById(id);

        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [id, type]);

  return { data, loading, error };
}

export function useGroups(includeAstrologers: boolean = false) {
  const [data, setData] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchGroups(includeAstrologers);
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [includeAstrologers]);

  return { data, loading, error };
}

// ===================================
// ANALYTICS HOOKS
// ===================================

export function useAnalyticsOverview(days: number) {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAnalyticsOverview(days);
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [days]);

  return { data, loading, error };
}

export function useGroupPerformance(days: number) {
  const [data, setData] = useState<GroupPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchGroupPerformanceAnalytics(days);
        if (!cancelled) {
          setData(response.data.groups);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [days]);

  return { data, loading, error };
}

export function useAcceptanceRate(days: number) {
  const [data, setData] = useState<AcceptanceRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAcceptanceRate(days);
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [days]);

  return { data, loading, error };
}

// ===================================
// SETTINGS HOOKS
// ===================================

export function useAssignmentRules() {
  const [data, setData] = useState<AssignmentRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAssignmentRules();
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

export function useGroupPriorities() {
  const [data, setData] = useState<GroupPriorities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchGroupPriorities();
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

export function useTimeoutSettings() {
  const [data, setData] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchTimeoutSettings();
        if (!cancelled) {
          setData(response.data.expiryMinutes);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

// ===================================
// MUTATION HOOKS
// ===================================

export function useAssignRequest() {
  const [loading, setLoading] = useState(false);

  const assign = useCallback(
    async (requestId: number, groupId: number, type: "call" | "chat") => {
      setLoading(true);
      try {
        const response =
          type === "call"
            ? await assignCallRequest(requestId, groupId)
            : await assignChatRequest(requestId, groupId);

        return response;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { assign, loading };
}

export function useReassignRequest() {
  const [loading, setLoading] = useState(false);

  const reassign = useCallback(
    async (
      requestId: number,
      type: "call" | "chat",
      groupId?: number,
      broadcast?: boolean
    ) => {
      setLoading(true);
      try {
        const response =
          type === "call"
            ? await reassignCallRequest(requestId, groupId, broadcast)
            : await reassignChatRequest(requestId, groupId, broadcast);

        return response;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { reassign, loading };
}

export function useBulkAssign() {
  const [loading, setLoading] = useState(false);

  const bulkAssign = useCallback(async (payload: BulkAssignPayload) => {
    setLoading(true);
    try {
      const response = await bulkAssignRequests(payload);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bulkAssign, loading };
}

export function useSaveSettings() {
  const [loading, setLoading] = useState(false);

  const saveRules = useCallback(async (rules: Partial<AssignmentRules>) => {
    setLoading(true);
    try {
      const response = await saveAssignmentRules(rules);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const savePriorities = useCallback(async (priorities: GroupPriorities) => {
    setLoading(true);
    try {
      const response = await saveGroupPriorities(priorities);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTimeout = useCallback(async (expiryMinutes: number) => {
    setLoading(true);
    try {
      const response = await saveTimeoutSettings(expiryMinutes);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  return { saveRules, savePriorities, saveTimeout, loading };
}

// ===================================
// COUNTDOWN HOOK
// ===================================

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);

    if (initialSeconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initialSeconds]);

  return seconds;
}