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
      // Clear any stale state and redirect to login
      window.location.href = '/login';
      return null;
    }
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorText;
    } catch (e) {
      // Error is not JSON or has no message
    }
    throw new Error(errorMessage);
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
};

export default api;
