/**
 * API Client - Standardized API calls with HttpOnly cookie support
 * 
 * NOTE: Authentication is now handled via HttpOnly cookies for security.
 * The browser automatically sends cookies with 'credentials: include'.
 * This prevents XSS attacks from stealing JWT tokens.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper to get auth headers (no token needed - using HttpOnly cookies)
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Generic fetch wrapper
async function fetchWrapper(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  console.log(`[API] Fetching: ${url}`, { method: options.method || 'GET' });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
      // Important: include cookies in cross-origin requests
      credentials: 'include',
    });
    return response;
  } catch (error) {
    // Gracefully handle backend connection offline errors so they do not crash Next.js dev mode
    console.warn(`[API] Connection failed for ${url}. Backend may be offline. Error:`, error instanceof Error ? error.message : 'Unknown network error');
    
    // Return a mock 503 Service Unavailable response instead of throwing to prevent unhandled rejections
    return new Response(JSON.stringify({ message: "Backend API is currently offline" }), {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Fixed version of the main wrapper that handles response parsing
async function apiFetchWrapper(endpoint: string, options: RequestInit = {}) {
  const response = await fetchWrapper(endpoint, options);

  if (!response.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
      return null;
    }

    let errorMessage = `HTTP ${response.status}`;
    let errorData = null;

    try {
      const errorText = await response.text();
      errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorText;
    } catch (e) {
      // Error is not JSON
    }

    console.error(`[apiFetchWrapper] Error on endpoint ${endpoint}:`, errorMessage);

    // Create an error object with status and data
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // Return null for 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// API Methods
const api = {
  // Auth (using HttpOnly cookies)
  auth: {
    /**
     * Login - Sends token to backend which sets HttpOnly cookie
     * @param token - Supabase JWT token
     */
    login: (token: string) => apiFetchWrapper('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
    
    /**
     * Logout - Clears the HttpOnly cookie
     */
    logout: () => apiFetchWrapper('/auth/logout', {
      method: 'POST',
    }),
    
    /**
     * Get current session from cookie
     */
    getSession: () => apiFetchWrapper('/auth/session'),
    
    /**
     * Sync user with backend
     */
    sync: (data: any) => apiFetchWrapper('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Simulation
  sim: {
    getAccount: (datasetId: string, userId?: string) =>
      apiFetchWrapper(`/sim/account?datasetId=${datasetId}${userId ? `&userId=${userId}` : ''}`),
    getOrders: (datasetId: string, userId?: string) =>
      apiFetchWrapper(`/sim/orders?datasetId=${datasetId}${userId ? `&userId=${userId}` : ''}`),
    createOrder: (data: any) =>
      apiFetchWrapper('/sim/orders', { method: 'POST', body: JSON.stringify(data) }),
    cancelOrder: (orderId: string) =>
      apiFetchWrapper(`/sim/orders/${orderId}/cancel`, { method: 'PATCH' }),
    closeOrder: (orderId: string) =>
      apiFetchWrapper(`/sim/orders/${orderId}/close`, { method: 'POST' }),
    getDatasets: () => apiFetchWrapper('/sim/datasets'),
    loadDataset: (datasetId: string, userId: string) =>
      apiFetchWrapper('/sim/stream/load', { method: 'POST', body: JSON.stringify({ datasetId, userId }) }),
  },

  // Market Data
  market: {
    getBars: (symbol: string, timeframe: string) =>
      apiFetchWrapper(`/api/bars?symbol=${symbol}&tf=${timeframe}`),
    getPairs: () => apiFetchWrapper('/pairs'),
  },

  // Dashboard
  dashboard: {
    getSimData: (userId: string, datasetId: string, txLimit: number = 20) =>
      apiFetchWrapper(`/dashboard/sim?userId=${userId}&datasetId=${datasetId}&txLimit=${txLimit}`),
    getHistory: (userId: string, datasetId: string, params: any = {}) => {
      const qs = new URLSearchParams({ userId, datasetId, ...params }).toString();
      return apiFetchWrapper(`/dashboard/history?${qs}`);
    },
  },

  // Credits
  credits: {
    getBalance: () => apiFetchWrapper('/credits/balance'),
    getHistory: () => apiFetchWrapper('/credits/history'),
    getReferral: () => apiFetchWrapper('/credits/referral'),
    applyReferral: (referralCode: string) =>
      apiFetchWrapper('/credits/referral/apply', {
        method: 'POST',
        body: JSON.stringify({ referralCode }),
      }),
    calculateDiscount: (packagePrice: number) =>
      apiFetchWrapper('/credits/calculate-discount', {
        method: 'POST',
        body: JSON.stringify({ packagePrice }),
      }),
    redeem: (packagePrice: number, packageName: string) =>
      apiFetchWrapper('/credits/redeem', {
        method: 'POST',
        body: JSON.stringify({ packagePrice, packageName }),
      }),
  },

  // Challenges
  challenges: {
    getAll: (userId: string) =>
      apiFetchWrapper(`/api/challenges?userId=${userId}`),
    getOne: (challengeId: string) =>
      apiFetchWrapper(`/api/challenges/${challengeId}`),
    getOrders: (challengeId: string) =>
      apiFetchWrapper(`/api/challenges/${challengeId}/orders`),
    createOrder: (challengeId: string, data: any) =>
      apiFetchWrapper(`/api/challenges/${challengeId}/orders`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    cancelOrder: (challengeId: string, orderId: string) =>
      apiFetchWrapper(`/api/challenges/${challengeId}/orders/${orderId}/cancel`, {
        method: 'PATCH',
      }),
  },
};

export default api;
