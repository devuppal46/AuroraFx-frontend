"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';

/**
 * Dual-Pipe WebSocket Architecture for AuroraFx (Next.js)
 *
 * Architecture:
 *   - Firehose: High-frequency public market data (ticks, bars, sim playback)
 *   - App State: Low-latency private user events (orders, balance, notifications)
 */

// ============================================
// Types
// ============================================

interface PriceData {
  price: number;
  bid: number;
  ask: number;
  volume: number;
  ts: number;
}

interface SimBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  datasetId?: string;
}

interface OrderUpdate {
  type: string;
  receivedAt: number;
  [key: string]: any;
}

interface BalanceData {
  equity: number;
  balance: number;
  margin: number;
  freeMargin: number;
  timestamp: number;
}

interface DualPipeContextType {
  prices: Record<string, PriceData>;
  simBars: SimBar[];
  isConnectedFirehose: boolean;
  firehoseError: string | null;
  orderUpdates: OrderUpdate[];
  balance: BalanceData | null;
  notifications: any[];
  isConnectedAppState: boolean;
  appStateError: string | null;
  firehoseWsRef: React.MutableRefObject<WebSocket | null>;
  appStateWsRef: React.MutableRefObject<WebSocket | null>;
  subscribeChannels: (channels: string[]) => void;
}

// ============================================
// Context
// ============================================

const DualPipeContext = createContext<DualPipeContextType | null>(null);

/**
 * Provider: Manages TWO independent WebSocket connections
 */
export function DualPipeProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [simBars, setSimBars] = useState<SimBar[]>([]);
  const [isConnectedFirehose, setIsConnectedFirehose] = useState(false);
  const [firehoseError, setFirehoseError] = useState<string | null>(null);

  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnectedAppState, setIsConnectedAppState] = useState(false);
  const [appStateError, setAppStateError] = useState<string | null>(null);

  const firehoseWsRef = useRef<WebSocket | null>(null);
  const appStateWsRef = useRef<WebSocket | null>(null);
  const firehoseReconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const appStateReconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const firehoseReconnectAttempt = useRef(0);
  const appStateReconnectAttempt = useRef(0);
  const mountedRef = useRef(true);

  const priceBufferRef = useRef<Record<string, PriceData>>({});
  const flushScheduledRef = useRef(false);

  const FIREHOSE_WS_URL = process.env.NEXT_PUBLIC_FIREHOSE_WS_URL;
  const APP_STATE_WS_URL = process.env.NEXT_PUBLIC_APP_STATE_WS_URL;

  const flushPriceBuffer = useCallback(() => {
    if (!mountedRef.current) return;

    const bufferedPrices = { ...priceBufferRef.current };
    if (Object.keys(bufferedPrices).length > 0) {
      setPrices(prev => ({ ...prev, ...bufferedPrices }));
      priceBufferRef.current = {};
    }

    flushScheduledRef.current = false;
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushScheduledRef.current) return;
    flushScheduledRef.current = true;

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(flushPriceBuffer);
    } else {
      setTimeout(flushPriceBuffer, 50);
    }
  }, [flushPriceBuffer]);

  const connectFirehose = useCallback(() => {
    if (!FIREHOSE_WS_URL) {
      setFirehoseError('NEXT_PUBLIC_FIREHOSE_WS_URL not configured');
      return;
    }
    if (firehoseWsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(FIREHOSE_WS_URL);
      firehoseWsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('✅ Firehose WebSocket connected');
        setIsConnectedFirehose(true);
        setFirehoseError(null);
        firehoseReconnectAttempt.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'price') {
            const symbol = msg.symbol?.toUpperCase().replace(/[^A-Z]/g, '');
            if (symbol) {
              priceBufferRef.current[symbol] = {
                price: msg.price,
                bid: msg.bid,
                ask: msg.ask,
                volume: msg.volume || 0,
                ts: msg.timestamp || Date.now(),
              };
              scheduleFlush();
            }
          }

          if (msg.type === 'bar' && msg.source === 'SIM') {
            setSimBars(prev => [...prev, {
              time: msg.time,
              open: Number(msg.open),
              high: Number(msg.high),
              low: Number(msg.low),
              close: Number(msg.close),
              volume: Number(msg.volume || 0),
              datasetId: msg.datasetId,
            }]);
          }
        } catch (err) {
          console.error('Firehose WS parse error:', err);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setIsConnectedFirehose(false);
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        setIsConnectedFirehose(false);
        firehoseWsRef.current = null;

        if (event.code === 1000) return;

        firehoseReconnectAttempt.current += 1;
        const baseDelay = Math.min(1000 * (2 ** firehoseReconnectAttempt.current), 30000);
        const jitteredDelay = Math.max(Math.random() * baseDelay, 100);

        firehoseReconnectTimer.current = setTimeout(() => {
          if (mountedRef.current) connectFirehose();
        }, jitteredDelay);
      };
    } catch (err: any) {
      setFirehoseError(err.message);
    }
  }, [FIREHOSE_WS_URL, scheduleFlush]);

  const connectAppState = useCallback(() => {
    if (!APP_STATE_WS_URL) {
      setAppStateError('NEXT_PUBLIC_APP_STATE_WS_URL not configured');
      return;
    }
    if (appStateWsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(APP_STATE_WS_URL);
      appStateWsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('✅ App State WebSocket connected');
        setIsConnectedAppState(true);
        setAppStateError(null);
        appStateReconnectAttempt.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'order') {
            setOrderUpdates(prev => [...prev, { ...msg, receivedAt: Date.now() }]);
          }

          if (msg.type === 'balance') {
            setBalance({
              equity: msg.equity,
              balance: msg.balance,
              margin: msg.margin,
              freeMargin: msg.freeMargin,
              timestamp: msg.timestamp || Date.now(),
            });
          }

          if (msg.type === 'notification') {
            setNotifications(prev => [...prev, { ...msg, receivedAt: Date.now() }]);
          }
        } catch (err) {
          console.error('App State WS parse error:', err);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setIsConnectedAppState(false);
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        setIsConnectedAppState(false);
        appStateWsRef.current = null;

        if (event.code === 1000) return;

        appStateReconnectAttempt.current += 1;
        const baseDelay = Math.min(1000 * (2 ** appStateReconnectAttempt.current), 30000);
        const jitteredDelay = Math.max(Math.random() * baseDelay, 100);

        appStateReconnectTimer.current = setTimeout(() => {
          if (mountedRef.current) connectAppState();
        }, jitteredDelay);
      };
    } catch (err: any) {
      setAppStateError(err.message);
    }
  }, [APP_STATE_WS_URL]);

  useEffect(() => {
    mountedRef.current = true;
    connectFirehose();
    connectAppState();

    return () => {
      mountedRef.current = false;
      if (firehoseReconnectTimer.current) clearTimeout(firehoseReconnectTimer.current);
      if (firehoseWsRef.current) {
        firehoseWsRef.current.close(1000, 'Provider unmounting');
        firehoseWsRef.current = null;
      }
      if (appStateReconnectTimer.current) clearTimeout(appStateReconnectTimer.current);
      if (appStateWsRef.current) {
        appStateWsRef.current.close(1000, 'Provider unmounting');
        appStateWsRef.current = null;
      }
    };
  }, [connectFirehose, connectAppState]);

  const subscribeChannels = useCallback((_channels: string[]) => {
    // No-op in dual-pipe architecture
  }, []);

  const value: DualPipeContextType = {
    prices,
    simBars,
    isConnectedFirehose,
    firehoseError,
    orderUpdates,
    balance,
    notifications,
    isConnectedAppState,
    appStateError,
    firehoseWsRef,
    appStateWsRef,
    subscribeChannels,
  };

  return (
    <DualPipeContext.Provider value={value}>
      {children}
    </DualPipeContext.Provider>
  );
}

// ============================================
// Hooks
// ============================================

export function useFirehose() {
  const ctx = useContext(DualPipeContext);
  if (!ctx) {
    return { prices: {} as Record<string, PriceData>, simBars: [] as SimBar[], isConnected: false, error: 'No provider' as string | null };
  }
  return {
    prices: ctx.prices,
    simBars: ctx.simBars,
    isConnected: ctx.isConnectedFirehose,
    error: ctx.firehoseError,
  };
}

export function useLivePrice(symbol: string) {
  const { prices, isConnected, error } = useFirehose();
  const normalized = symbol ? symbol.toUpperCase().replace(/[^A-Z]/g, '') : '';
  const data = prices[normalized] || {} as PriceData;

  return {
    price: data.price || 0,
    bid: data.bid || 0,
    ask: data.ask || 0,
    timestamp: data.ts || 0,
    isConnected,
    error,
  };
}

export function useSimBars() {
  const { simBars, isConnected, error } = useFirehose();
  const [formattedBars, setFormattedBars] = useState<any[]>([]);

  useEffect(() => {
    if (simBars.length === 0) return;

    setFormattedBars(simBars.map(bar => ({
      date: new Date(bar.time),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
    })));
  }, [simBars]);

  return {
    bars: formattedBars,
    latestBar: simBars[simBars.length - 1] || null,
    isConnected,
    error,
    resetBars: () => setFormattedBars([]),
  };
}

export function useAppState() {
  const ctx = useContext(DualPipeContext);
  if (!ctx) {
    return {
      orderUpdates: [],
      balance: null,
      notifications: [],
      isConnected: false,
      error: 'No provider' as string | null,
    };
  }
  return {
    orderUpdates: ctx.orderUpdates,
    balance: ctx.balance,
    notifications: ctx.notifications,
    isConnected: ctx.isConnectedAppState,
    error: ctx.appStateError,
  };
}

export function useAWSWebSocket() {
  const ctx = useContext(DualPipeContext);
  if (!ctx) {
    return {
      prices: {} as Record<string, PriceData>,
      simBar: null,
      isConnected: false,
      error: 'No provider' as string | null,
      subscribeChannels: (_channels: string[]) => {},
    };
  }

  const latestSimBar = ctx.simBars[ctx.simBars.length - 1] || null;

  return {
    prices: ctx.prices,
    simBar: latestSimBar,
    isConnected: ctx.isConnectedFirehose || ctx.isConnectedAppState,
    error: ctx.firehoseError || ctx.appStateError,
    subscribeChannels: ctx.subscribeChannels,
    wsRef: ctx.firehoseWsRef,
  };
}

export default DualPipeProvider;
