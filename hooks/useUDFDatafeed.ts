"use client";

/**
 * useUDFDatafeed Hook with IndexedDB Caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getBars, saveBars, getLastBarTimestamp } from '../lib/db';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const TIMEFRAME_TO_RESOLUTION: Record<string, string> = {
  '1s': '1',
  '15s': '1',
  '1m': '1',
  '3m': '3',
  '5m': '5',
  '15m': '15',
  '30m': '30',
  '1H': '60',
  '2H': '120',
  '4H': '240',
  '1D': '1D',
  '1W': '1W',
  '1M': '1M',
};

export const getResolutionFromTimeframe = (timeframe: string): string => {
  return TIMEFRAME_TO_RESOLUTION[timeframe] || '1';
};

export function useUDFHistory({
  symbol,
  timeframe = '1m',
  from,
  to,
  enabled = true,
  fallbackToLive = true,
}: {
  symbol: string;
  timeframe?: string;
  from?: number;
  to?: number;
  enabled?: boolean;
  fallbackToLive?: boolean;
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deltaLoading, setDeltaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLiveFeed, setUseLiveFeed] = useState(false);

  const cacheLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDelta = async (sym: string, tf: string, fromTime: number, toTime: number, existingBars: any[]) => {
    try {
      const resolution = getResolutionFromTimeframe(tf);
      const url = `${API_BASE}/udf/history?symbol=${encodeURIComponent(sym)}&resolution=${resolution}&from=${fromTime}&to=${toTime}`;
      const response = await fetch(url, { signal: abortControllerRef.current?.signal });
      if (!response.ok) return;
      const result = await response.json();
      if (result.s === 'error' || result.s === 'no_data') return;
      const newBars = result.t.map((time: number, i: number) => ({
        date: new Date(time * 1000),
        open: result.o[i],
        high: result.h[i],
        low: result.l[i],
        close: result.c[i],
        volume: result.v[i],
      }));
      if (newBars.length === 0) return;
      const mergedBars = [...existingBars, ...newBars];
      await saveBars(sym, tf, mergedBars);
      setData(mergedBars);
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('[UDF] Delta fetch error:', err);
    }
  };

  const fetchFullHistory = async (sym: string, tf: string, fromTime: number, toTime: number) => {
    try {
      const resolution = getResolutionFromTimeframe(tf);
      const url = `${API_BASE}/udf/history?symbol=${encodeURIComponent(sym)}&resolution=${resolution}&from=${fromTime}&to=${toTime}`;
      const response = await fetch(url, { signal: abortControllerRef.current?.signal });
      if (!response.ok) {
        if (fallbackToLive && (response.status === 404 || response.status >= 500)) {
          setUseLiveFeed(true);
          setData([]);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.s === 'error') {
        if (fallbackToLive) { setUseLiveFeed(true); setData([]); return; }
        throw new Error(result.errmsg || 'Unknown error');
      }
      if (result.s === 'no_data') {
        if (fallbackToLive) setUseLiveFeed(true);
        setData([]);
        return;
      }
      const bars = result.t.map((time: number, i: number) => ({
        date: new Date(time * 1000),
        open: result.o[i],
        high: result.h[i],
        low: result.l[i],
        close: result.c[i],
        volume: result.v[i],
      }));
      await saveBars(sym, tf, bars);
      setData(bars);
      setUseLiveFeed(false);
    } catch (err: any) {
      if (err.name !== 'AbortError') throw err;
    }
  };

  const fetchData = useCallback(async () => {
    if (!symbol || !enabled) return;
    const now = Math.floor(Date.now() / 1000);
    const fetchFrom = from || now - 24 * 60 * 60;
    const fetchTo = to || now;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setUseLiveFeed(false);

    try {
      const cachedBars = await getBars(symbol, timeframe);
      if (cachedBars && cachedBars.length > 0) {
        setData(cachedBars);
        setLoading(false);
        const lastCachedTime = await getLastBarTimestamp(symbol, timeframe);
        const deltaFrom = lastCachedTime ? lastCachedTime + 60 : fetchFrom;
        if (deltaFrom < fetchTo) {
          setDeltaLoading(true);
          await fetchDelta(symbol, timeframe, deltaFrom, fetchTo, cachedBars);
        }
        cacheLoadedRef.current = true;
        return;
      }
      await fetchFullHistory(symbol, timeframe, fetchFrom, fetchTo);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (fallbackToLive) {
          setUseLiveFeed(true);
          setError(null);
        } else {
          setError(err.message);
        }
      }
    } finally {
      setLoading(false);
      setDeltaLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe, from, to, enabled, fallbackToLive]);

  useEffect(() => {
    cacheLoadedRef.current = false;
    fetchData();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchData]);

  return { data, loading, error, useLiveFeed, isDeltaLoading: deltaLoading };
}

export default useUDFHistory;
