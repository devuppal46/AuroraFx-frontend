"use client";

/**
 * TanStack Query Hooks for AuroraFX
 * 
 * Centralized data fetching hooks with caching, auto-revalidation,
 * and optimistic updates for trading data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// ============================================================================
// Helper Functions
// ============================================================================

const getHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleQueryError = (error: any, context: string) => {
  console.error(`[Query Error] ${context}:`, error);
  toast.error(error.message || `Failed to load ${context}`);
};

// ============================================================================
// Account Queries
// ============================================================================

const fetchSimAccount = async ({ userId, datasetId }: { userId: string; datasetId: string }) => {
  return api.sim.getAccount(datasetId, userId);
};

export const useAccount = ({
  userId,
  datasetId,
  challengeId,
  mode = 'simulation',
  ...options
}: any = {}) => {
  const isEnabled = !!userId && (mode === 'simulation' ? !!datasetId : true);

  const queryKey = mode === 'simulation'
    ? ['account', userId, datasetId, 'sim']
    : ['account', userId, challengeId, 'live'];

  return useQuery({
    queryKey,
    queryFn: () => fetchSimAccount({ userId, datasetId }),
    enabled: isEnabled,
    staleTime: 30 * 1000,
    ...options,
  });
};

// ============================================================================
// Orders Queries
// ============================================================================

const fetchOrders = async ({ userId, datasetId }: { userId: string; datasetId: string }) => {
  return api.sim.getOrders(datasetId, userId);
};

export const useOrders = ({
  userId,
  datasetId,
  mode = 'simulation',
  isActive = true,
  ...options
}: any = {}) => {
  const isEnabled = !!userId && !!datasetId && isActive;

  const queryKey = mode === 'simulation'
    ? ['orders', userId, datasetId, 'sim']
    : ['orders', userId, datasetId, 'live'];

  return useQuery({
    queryKey,
    queryFn: () => fetchOrders({ userId, datasetId }),
    enabled: isEnabled,
    refetchInterval: isActive ? 5000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 5000,
    ...options,
  });
};

// ============================================================================
// Positions Queries
// ============================================================================

const fetchPositions = async ({ userId, datasetId }: { userId: string; datasetId: string }) => {
  const orders = await fetchOrders({ userId, datasetId });
  return (orders || []).filter((order: any) =>
    order.status === 'FILLED' && !order.closedAt
  );
};

export const usePositions = (params: any = {}) => {
  const { userId, datasetId, mode = 'simulation', isActive = true, ...options } = params;

  const isEnabled = !!userId && !!datasetId && isActive;

  const queryKey = mode === 'simulation'
    ? ['positions', userId, datasetId, 'sim']
    : ['positions', userId, datasetId, 'live'];

  return useQuery({
    queryKey,
    queryFn: () => fetchPositions({ userId, datasetId }),
    enabled: isEnabled,
    refetchInterval: isActive ? 5000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 5000,
    ...options,
  });
};

// ============================================================================
// Dashboard Data Queries
// ============================================================================

const fetchDashboardData = async ({ userId, datasetId }: { userId: string; datasetId: string }) => {
  if (!userId || !datasetId) throw new Error('Missing userId or datasetId');

  const res = await fetch(
    `${API_BASE}/dashboard/sim?userId=${userId}&datasetId=${datasetId}&txLimit=20`,
    { headers: getHeaders() }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }

  return res.json();
};

export const useDashboard = ({ userId, datasetId, ...options }: any = {}) => {
  const isEnabled = !!userId && !!datasetId;

  return useQuery({
    queryKey: ['dashboard', userId, datasetId],
    queryFn: () => fetchDashboardData({ userId, datasetId }),
    enabled: isEnabled,
    staleTime: 30 * 1000,
    ...options,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

// ============================================================================
// Credits Queries
// ============================================================================

export interface CreditsBalance {
  balance: number;
  userId: string;
}

export const useCreditsBalance = ({ userId, ...options }: any = {}) => {
  return useQuery<CreditsBalance>({
    queryKey: ['credits', 'balance', userId],
    queryFn: () => api.credits.getBalance(),
    enabled: !!userId,
    staleTime: 30 * 1000,
    ...options,
  });
};

export const useCreditsHistory = ({ userId, ...options }: any = {}) => {
  return useQuery({
    queryKey: ['credits', 'history', userId],
    queryFn: () => api.credits.getHistory(),
    enabled: !!userId,
    staleTime: 30 * 1000,
    ...options,
  });
};

export const useCreditsReferral = ({ userId, ...options }: any = {}) => {
  return useQuery({
    queryKey: ['credits', 'referral', userId],
    queryFn: () => api.credits.getReferral(),
    enabled: !!userId,
    staleTime: 60 * 1000,
    ...options,
  });
};

export const useApplyReferral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referralCode, userId }: { referralCode: string; userId: string }) => {
      const result = await api.credits.applyReferral(referralCode);
      if (result && !result.success) throw new Error(result.error || 'Failed to apply referral code');
      return result;
    },
    onSuccess: (_data, variables) => {
      toast.success('Referral code applied! +50 credits');
      queryClient.invalidateQueries({ queryKey: ['credits', 'balance', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['credits', 'history', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['credits', 'referral', variables.userId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to apply referral code');
    },
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, userId, mode }: { orderId: string; userId: string; mode?: string; datasetId?: string }) => {
      const url = `${API_BASE}/sim/orders/${orderId}/cancel?userId=${userId}`;
      const res = await fetch(url, { method: 'PATCH', headers: getHeaders() });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => { toast.success('Order cancelled'); },
    onError: (error: any) => { toast.error(error.message || 'Failed to cancel order'); },
    onSettled: (_data, _error, variables) => {
      const { userId, datasetId } = variables as any;
      queryClient.invalidateQueries({ queryKey: ['orders', userId, datasetId, 'sim'] });
    },
  });
};

// ============================================================================
// Trade History Query
// ============================================================================

const fetchTradeHistory = async ({
  userId,
  datasetId,
  side,
  from,
  to,
}: {
  userId: string;
  datasetId: string;
  side?: string;
  from?: string;
  to?: string;
}) => {
  if (!userId || !datasetId) throw new Error('Missing userId or datasetId');
  const params = new URLSearchParams({ userId, datasetId });
  if (side && side !== 'ALL') params.set('side', side);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${API_BASE}/dashboard/history?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }
  return res.json();
};

export const useTradeHistory = ({
  userId,
  datasetId,
  side,
  from,
  to,
  ...options
}: any = {}) => {
  return useQuery({
    queryKey: ['tradeHistory', userId, datasetId, side, from, to],
    queryFn: () => fetchTradeHistory({ userId, datasetId, side, from, to }),
    enabled: !!userId && !!datasetId,
    staleTime: 30 * 1000,
    ...options,
  });
};
