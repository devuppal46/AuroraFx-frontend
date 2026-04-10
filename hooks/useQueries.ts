"use client";

/**
 * TanStack Query Hooks for AuroraFX
 * 
 * Centralized data fetching hooks with caching, auto-revalidation,
 * and optimistic updates for trading data.
 * Supports both Simulation and Challenge trading modes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/api';

// ============================================================================
// Helper Functions
// ============================================================================

const handleQueryError = (error: any, context: string) => {
  console.error(`[Query Error] ${context}:`, error);
  toast.error(error.message || `Failed to load ${context}`);
};

// ============================================================================
// Account Queries
// ============================================================================

export const useAccount = ({
  userId,
  datasetId,
  challengeId,
  mode = 'simulation',
  ...options
}: any = {}) => {
  const isEnabled = mode === 'simulation'
    ? !!userId && !!datasetId
    : !!challengeId;

  const queryKey = mode === 'simulation'
    ? ['account', userId, datasetId, 'sim']
    : ['account', challengeId, 'challenge'];

  return useQuery({
    queryKey,
    queryFn: () =>
      mode === 'simulation'
        ? api.sim.getAccount(datasetId, userId)
        : api.challenges.getOne(challengeId),
    enabled: isEnabled,
    staleTime: 30 * 1000,
    ...options,
  });
};

// ============================================================================
// Orders Queries
// ============================================================================

export const useOrders = ({
  userId,
  datasetId,
  challengeId,
  mode = 'simulation',
  isActive = true,
  ...options
}: any = {}) => {
  const isEnabled = mode === 'simulation'
    ? !!userId && !!datasetId && isActive
    : !!challengeId && isActive;

  const queryKey = mode === 'simulation'
    ? ['orders', userId, datasetId, 'sim']
    : ['orders', challengeId, 'challenge'];

  return useQuery({
    queryKey,
    queryFn: () =>
      mode === 'simulation'
        ? api.sim.getOrders(datasetId, userId)
        : api.challenges.getOrders(challengeId),
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

export const usePositions = (params: any = {}) => {
  const { userId, datasetId, challengeId, mode = 'simulation', isActive = true, ...options } = params;

  const isEnabled = mode === 'simulation'
    ? !!userId && !!datasetId && isActive
    : !!challengeId && isActive;

  const queryKey = mode === 'simulation'
    ? ['positions', userId, datasetId, 'sim']
    : ['positions', challengeId, 'challenge'];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (mode === 'simulation') {
        const orders = await api.sim.getOrders(datasetId, userId);
        return (orders || []).filter((order: any) =>
          order.status === 'FILLED' && !order.closedAt
        );
      } else {
        const trades = await api.challenges.getOrders(challengeId);
        return (trades || []).filter((trade: any) =>
          trade.status === 'FILLED' && !trade.closedAt
        );
      }
    },
    enabled: isEnabled,
    refetchInterval: isActive ? 5000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 5000,
    ...options,
  });
};

// ============================================================================
// Challenges Queries
// ============================================================================

export const useChallenges = ({ userId, ...options }: any = {}) => {
  return useQuery({
    queryKey: ['challenges', userId],
    queryFn: () => api.challenges.getAll(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
    ...options,
  });
};

export const useChallengeMetrics = ({ challengeId, ...options }: any = {}) => {
  return useQuery({
    queryKey: ['challenge', challengeId, 'metrics'],
    queryFn: () => api.challenges.getOne(challengeId),
    enabled: !!challengeId,
    staleTime: 10 * 1000,
    ...options,
  });
};

// ============================================================================
// Dashboard Data Queries
// ============================================================================

export const useDashboard = ({ userId, datasetId, ...options }: any = {}) => {
  const isEnabled = !!userId && !!datasetId;

  return useQuery({
    queryKey: ['dashboard', userId, datasetId],
    queryFn: () => api.dashboard.getSimData(userId, datasetId),
    enabled: isEnabled,
    staleTime: 30 * 1000,
    ...options,
  });
};

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
    mutationFn: async ({ orderId, userId, datasetId, challengeId, mode = 'simulation' }: {
      orderId: string; userId: string; datasetId?: string; challengeId?: string; mode?: string;
    }) => {
      if (mode === 'challenge' && challengeId) {
        return api.challenges.cancelOrder(challengeId, orderId);
      }
      return api.sim.cancelOrder(orderId);
    },
    onSuccess: () => { toast.success('Order cancelled'); },
    onError: (error: any) => { toast.error(error.message || 'Failed to cancel order'); },
    onSettled: (_data, _error, variables) => {
      const { userId, datasetId, challengeId, mode } = variables as any;
      if (mode === 'challenge' && challengeId) {
        queryClient.invalidateQueries({ queryKey: ['orders', challengeId, 'challenge'] });
        queryClient.invalidateQueries({ queryKey: ['account', challengeId, 'challenge'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['orders', userId, datasetId, 'sim'] });
      }
    },
  });
};

export const useChallengeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ challengeId, data }: { challengeId: string; data: any }) => {
      return api.challenges.createOrder(challengeId, data);
    },
    onSuccess: (_data, variables) => {
      toast.success('Challenge order placed');
      queryClient.invalidateQueries({ queryKey: ['orders', variables.challengeId, 'challenge'] });
      queryClient.invalidateQueries({ queryKey: ['account', variables.challengeId, 'challenge'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place challenge order');
    },
  });
};

// ============================================================================
// Trade History Query
// ============================================================================

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
    queryFn: () => {
      const params: any = {};
      if (side && side !== 'ALL') params.side = side;
      if (from) params.from = from;
      if (to) params.to = to;
      return api.dashboard.getHistory(userId, datasetId, params);
    },
    enabled: !!userId && !!datasetId,
    staleTime: 30 * 1000,
    ...options,
  });
};
