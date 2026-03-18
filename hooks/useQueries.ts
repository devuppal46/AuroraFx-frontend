"use client";

/**
 * TanStack Query Hooks for AuroraFX
 * 
 * Centralized data fetching hooks with caching, auto-revalidation,
 * and optimistic updates for trading data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get auth headers for API requests
 */
const getHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Global error handler for queries
 */
const handleQueryError = (error: any, context: string) => {
  console.error(`[Query Error] ${context}:`, error);
  toast.error(error.message || `Failed to load ${context}`);
};

// ============================================================================
// Dashboard Data Queries
// ============================================================================

/**
 * Fetch dashboard summary data
 */
const fetchDashboardData = async ({ userId, datasetId }: { userId: string, datasetId: string }) => {
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

/**
 * Hook: useDashboard
 * 
 * Fetches dashboard data with caching.
 * Cache key: ['dashboard', userId, datasetId]
 * 
 */
export const useDashboard = ({ userId, datasetId, ...options }: any = {}) => {
  const isEnabled = !!userId && !!datasetId;
  
  return useQuery({
    queryKey: ['dashboard', userId, datasetId],
    queryFn: () => fetchDashboardData({ userId, datasetId }),
    enabled: isEnabled,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

// (Other hooks like useAccount, useOrders omitted here for brevity as we are just migrating the dashboard right now, but they can be added as needed)
