"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import api from "../lib/api";
import { User, Session } from "@supabase/supabase-js";

// Storage keys
const TRADING_MODE_KEY = 'aurorafx_trading_mode';
const ACTIVE_CHALLENGE_KEY = 'aurorafx_active_challenge_id';

type TradingMode = 'simulation' | 'challenge';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (userData: User | null) => void;
  loginWithGoogle: () => Promise<{ data: any; error: any }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isQueued: boolean;
  queueData: any;
  checkQueueStatus: () => Promise<void>;
  tradingMode: TradingMode;
  activeChallengeId: string | null;
  switchTradingMode: (mode: TradingMode, challengeId?: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQueued, setIsQueued] = useState(false);
  const [queueData, setQueueData] = useState<any>(null);
  const router = useRouter();

  // Trading mode state
  const [tradingMode, setTradingMode] = useState<TradingMode>(() => {
    if (typeof window === 'undefined') return 'simulation';
    return (localStorage.getItem(TRADING_MODE_KEY) as TradingMode) || 'simulation';
  });
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_CHALLENGE_KEY) || null;
  });

  /**
   * Switch between simulation and challenge trading modes.
   */
  const switchTradingMode = useCallback((mode: TradingMode, challengeId: string | null = null) => {
    setTradingMode(mode);
    localStorage.setItem(TRADING_MODE_KEY, mode);

    if (mode === 'challenge' && challengeId) {
      setActiveChallengeId(challengeId);
      localStorage.setItem(ACTIVE_CHALLENGE_KEY, challengeId);
    } else if (mode === 'simulation') {
      setActiveChallengeId(null);
      localStorage.removeItem(ACTIVE_CHALLENGE_KEY);
    }
    console.log(`🔀 Switched to ${mode} mode${challengeId ? ` (Challenge: ${challengeId})` : ''}`);
  }, []);

  useEffect(() => {
    console.log("👤 UserContext State Update:", { userEmail: user?.email, isLoading });
  }, [user, isLoading]);

  /**
   * Set up HttpOnly cookie session after Supabase authentication
   */
  const setupCookieSession = useCallback(async (supabaseSession: Session) => {
    if (!supabaseSession?.access_token) {
      console.error('No access token available for cookie session');
      return false;
    }

    try {
      // Send token to backend to set HttpOnly cookie
      const response = await api.auth.login(supabaseSession.access_token);
      
      if (response?.success) {
        console.log('✅ HttpOnly cookie session established');
        return true;
      } else {
        console.error('❌ Failed to establish cookie session:', response?.message);
        return false;
      }
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.includes("added to the virtual queue")) {
        console.warn('🚦 Traffic Control: User added to queue');
        setIsQueued(true);
        setQueueData(error.data || { position: 'Calculating...', retryAfter: 30 });
      } else if (error?.message === "Backend API is currently offline") {
        console.warn('⚠️ Backend API is currently offline. Skipping HttpOnly cookie session setup.');
      } else if (error?.status === 500 || error?.message?.includes('Internal server error') || error?.message?.includes('Missing userId')) {
        // Backend sync may fail during dev (e.g. missing SimDataset) — non-fatal
        console.warn('⚠️ Backend auth sync encountered an error (non-fatal):', error?.message);
      } else {
        console.warn('⚠️ Cookie session setup failed:', error?.message || error);
      }
      return false;
    }
  }, []);

  /**
   * Clear cookie session on logout
   */
  const clearCookieSession = useCallback(async () => {
    try {
      await api.auth.logout();
      console.log('✅ Cookie session cleared');
    } catch (error) {
      console.error('❌ Error clearing cookie session:', error);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user && session.user.email_confirmed_at) {
          // Set up HttpOnly cookie session
          const cookieSuccess = await setupCookieSession(session);
          
          if (cookieSuccess) {
            setUser(session.user);
          } else {
            // If cookie setup fails, still set user but log warning
            setUser(session.user);
            console.warn('Cookie session not established, falling back to header auth');
          }
        } else if (session && session.user && !session.user.email_confirmed_at) {
          // User exists but email not confirmed
          console.log('User exists but email not confirmed');
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          console.log('🔄 Password recovery event detected');
          router.push('/reset-password');
          return;
        }

        if (session && session.user) {
          // Check if email is confirmed
          if (session.user.email_confirmed_at || session.user.id === 'demo-user') {
            console.log("✅ User has confirmed email or is Demo:", session.user.email);
            // Set up HttpOnly cookie session
            const cookieSuccess = await setupCookieSession(session);
            
            if (cookieSuccess) {
              setUser(session.user);
            } else {
              setUser(session.user);
            }
          } else {
            // Email not confirmed - don't set user as authenticated
            console.warn("⚠️ Email not confirmed for user:", session.user.email);
            setUser(null);
          }
        } else {
          console.log("🚪 Auth event without session:", event);
          setUser(null);
          await clearCookieSession();
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setupCookieSession, clearCookieSession, router]);

  const login = (userData: User | null) => {
    setUser(userData);
  };

  const loginWithGoogle = async () => {
    try {
      let redirectUrl = "";
      if (typeof window !== "undefined") {
          redirectUrl = `${window.location.origin}/dashboard`;
      }
      console.log("🔵 Initiating Google Login with redirect:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const logout = async () => {
    try {
      // Clear cookie session first
      await clearCookieSession();
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      // Clear trading mode on logout
      setTradingMode('simulation');
      setActiveChallengeId(null);
      localStorage.removeItem(TRADING_MODE_KEY);
      localStorage.removeItem(ACTIVE_CHALLENGE_KEY);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const checkQueueStatus = useCallback(async () => {
    try {
      const response = await api.auth.getSession();
      if (response) {
        setIsQueued(false);
        setQueueData(null);
        // If they had a session, we might want to refresh the user
        if (response.user) setUser(response.user);
      }
    } catch (error: any) {
      if (error?.status === 429) {
        setQueueData(error.data);
      } else {
        setIsQueued(false);
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        loginWithGoogle,
        logout,
        isLoading,
        isQueued,
        queueData,
        checkQueueStatus,
        tradingMode,
        activeChallengeId,
        switchTradingMode,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
