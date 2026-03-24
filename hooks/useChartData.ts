"use client";

/**
 * useChartData Hook - Combines UDF historical data with live feed
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useUDFHistory, getResolutionFromTimeframe } from './useUDFDatafeed';
import { appendBar, appendBars } from '../lib/db';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export function useLiveBars({
  datasetId,
  symbol,
  timeframe,
  userId,
  enabled = true,
}: {
  datasetId?: string;
  symbol?: string;
  timeframe?: string;
  userId?: string;
  enabled?: boolean;
}) {
  const [bars, setBars] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const lastSyncRef = useRef(0);
  const pendingBarsRef = useRef<any[]>([]);

  const flushPendingBars = useCallback(async () => {
    if (!pendingBarsRef.current || pendingBarsRef.current.length === 0) return;
    const pending = [...pendingBarsRef.current];
    pendingBarsRef.current = [];
    const grouped = pending.reduce((acc: any, { symbol: s, timeframe: tf, bar }: any) => {
      const key = `${s}_${tf}`;
      if (!acc[key]) acc[key] = { symbol: s, timeframe: tf, bars: [] };
      acc[key].bars.push(bar);
      return acc;
    }, {});
    for (const { symbol: s, timeframe: tf, bars: b } of Object.values(grouped) as any[]) {
      try {
        if (b.length === 1) await appendBar(s, tf, b[0]);
        else await appendBars(s, tf, b);
      } catch (err) {
        console.error('[LiveBars] Failed to sync bars to IndexedDB:', err);
      }
    }
  }, []);

  const queueBarForSync = useCallback((s: string, tf: string, bar: any) => {
    pendingBarsRef.current.push({ symbol: s, timeframe: tf, bar });
    const now = Date.now();
    if (now - lastSyncRef.current > 5000 || pendingBarsRef.current.length >= 10) {
      flushPendingBars();
      lastSyncRef.current = now;
    }
  }, [flushPendingBars]);

  useEffect(() => {
    if (!datasetId || !enabled) {
      setBars([]);
      setIsConnected(false);
      return;
    }
    if (esRef.current) esRef.current.close();

    const url = `${API_BASE}/sim/stream?datasetId=${datasetId}&userId=${userId}`;
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    const toBar = (b: any) => ({
      date: new Date(b.time),
      open: Number(b.open),
      high: Number(b.high),
      low: Number(b.low),
      close: Number(b.close),
      volume: Number(b.volume),
    });

    es.addEventListener('open', () => { setIsConnected(true); setError(null); });

    es.addEventListener('seed', (e: any) => {
      try {
        const list = JSON.parse(e.data) || [];
        const newBars = list.map(toBar);
        setBars(newBars);
        if (symbol && timeframe && newBars.length > 0) {
          appendBars(symbol, timeframe, newBars).catch(() => {});
        }
      } catch (err) {
        console.error('[LiveBars] Error parsing seed data:', err);
      }
    });

    es.addEventListener('bar', (e: any) => {
      try {
        const b = JSON.parse(e.data);
        const newBar = toBar(b);
        setBars((prev) => {
          const lastBar = prev[prev.length - 1];
          if (lastBar && newBar.date.getTime() === lastBar.date.getTime()) {
            return [...prev.slice(0, -1), newBar];
          }
          return [...prev, newBar];
        });
        if (symbol && timeframe) queueBarForSync(symbol, timeframe, newBar);
      } catch (err) {
        console.error('[LiveBars] Error parsing bar data:', err);
      }
    });

    es.addEventListener('error', () => { setIsConnected(false); setError('Connection error'); });

    return () => {
      es.close();
      esRef.current = null;
      flushPendingBars();
    };
  }, [datasetId, enabled, symbol, timeframe, userId, flushPendingBars, queueBarForSync]);

  return { bars, isConnected, error };
}

export function useChartData({
  symbol,
  datasetId,
  userId,
  timeframe = '1m',
  paused = false,
  enabled = true,
}: {
  symbol: string;
  datasetId?: string;
  userId?: string;
  timeframe?: string;
  paused?: boolean;
  enabled?: boolean;
}) {
  const getTimeRange = useCallback((tf: string) => {
    const now = Math.floor(Date.now() / 1000);
    const resolution = getResolutionFromTimeframe(tf);
    let lookbackSeconds: number;
    switch (resolution) {
      case '1': lookbackSeconds = 24 * 60 * 60; break;
      case '5': lookbackSeconds = 5 * 24 * 60 * 60; break;
      case '15': lookbackSeconds = 10 * 24 * 60 * 60; break;
      case '60': lookbackSeconds = 30 * 24 * 60 * 60; break;
      case '240': lookbackSeconds = 90 * 24 * 60 * 60; break;
      case '1D': lookbackSeconds = 365 * 24 * 60 * 60; break;
      case '1W': lookbackSeconds = 2 * 365 * 24 * 60 * 60; break;
      default: lookbackSeconds = 24 * 60 * 60;
    }
    return { from: now - lookbackSeconds, to: now };
  }, []);

  const { from, to } = getTimeRange(timeframe);

  const {
    data: udfData,
    loading: udfLoading,
    error: udfError,
    useLiveFeed: shouldUseLiveFeed,
    isDeltaLoading,
  } = useUDFHistory({
    symbol,
    timeframe,
    from,
    to,
    enabled: enabled && !!symbol,
    fallbackToLive: true,
  });

  const {
    bars: liveBars,
    isConnected: liveConnected,
    error: liveError,
  } = useLiveBars({
    datasetId,
    symbol,
    timeframe,
    userId,
    enabled: enabled && (!!shouldUseLiveFeed || paused === false),
  });

  const mergedData = useMemo(() => {
    if (shouldUseLiveFeed) return liveBars;
    if (udfData.length > 0 && liveConnected && liveBars.length > 0) {
      const lastUdfBar = udfData[udfData.length - 1] as any;
      const lastLiveBar = liveBars[liveBars.length - 1] as any;
      if (lastUdfBar.date.getTime() === lastLiveBar.date.getTime()) {
        return [...udfData.slice(0, -1), lastLiveBar];
      }
      if (lastLiveBar.date > lastUdfBar.date) {
        const newLiveBars = liveBars.filter((bar: any) => bar.date > lastUdfBar.date);
        return [...udfData, ...newLiveBars];
      }
      return udfData;
    }
    return udfData;
  }, [udfData, liveBars, shouldUseLiveFeed, liveConnected]);

  const loading = udfLoading && liveBars.length === 0 && mergedData.length === 0;
  const error = udfError && liveError ? udfError : null;

  return {
    data: mergedData,
    loading,
    error,
    isUsingLiveFeed: shouldUseLiveFeed || udfData.length === 0,
    isConnected: liveConnected,
    isDeltaLoading,
  };
}

export default useChartData;
