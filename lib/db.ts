"use client";

/**
 * IndexedDB Cache Utility for AuroraFX
 * 
 * Provides persistent local storage for historical chart data
 * to enable instant loading and reduce backend pressure.
 */

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'AuroraFX_Cache';
const DB_VERSION = 1;
const STORE_NAME = 'bars_cache';

const MAX_BARS_PER_SYMBOL = 5000;

let dbPromise: Promise<IDBPDatabase> | null = null;

export interface BarData {
  date: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CacheRecord {
  key: string;
  symbol: string;
  timeframe: string;
  bars: BarData[];
  timestamp: number;
  count: number;
}

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('[IndexedDB] Created bars_cache store');
        }
      },
    });
  }
  return dbPromise;
}

function getCacheKey(symbol: string, timeframe: string): string {
  return `${symbol}_${timeframe}`;
}

export async function getBars(symbol: string, timeframe: string): Promise<BarData[] | null> {
  try {
    const db = await getDB();
    const key = getCacheKey(symbol, timeframe);
    const record = await db.get(STORE_NAME, key) as CacheRecord | undefined;

    if (!record) {
      console.log(`[IndexedDB] Cache miss: ${key}`);
      return null;
    }

    const bars = record.bars.map((bar: any) => ({
      ...bar,
      date: new Date(bar.date),
    }));

    console.log(`[IndexedDB] Cache hit: ${key} (${bars.length} bars)`);
    return bars;
  } catch (error) {
    console.error('[IndexedDB] Error getting bars:', error);
    return null;
  }
}

export async function saveBars(symbol: string, timeframe: string, bars: BarData[]): Promise<void> {
  try {
    const db = await getDB();
    const key = getCacheKey(symbol, timeframe);

    let barsToSave = bars;
    if (bars.length > MAX_BARS_PER_SYMBOL) {
      barsToSave = bars.slice(-MAX_BARS_PER_SYMBOL);
      console.log(`[IndexedDB] Pruned bars from ${bars.length} to ${MAX_BARS_PER_SYMBOL}`);
    }

    const serializableBars = barsToSave.map((bar: any) => ({
      ...bar,
      date: bar.date instanceof Date ? bar.date.toISOString() : bar.date,
    }));

    const record: CacheRecord = {
      key,
      symbol,
      timeframe,
      bars: serializableBars,
      timestamp: Date.now(),
      count: serializableBars.length,
    };

    await db.put(STORE_NAME, record);
    console.log(`[IndexedDB] Saved ${serializableBars.length} bars for ${key}`);
  } catch (error) {
    console.error('[IndexedDB] Error saving bars:', error);
  }
}

export async function appendBar(symbol: string, timeframe: string, newBar: BarData): Promise<void> {
  try {
    const existingBars = (await getBars(symbol, timeframe)) || [];

    const barToAdd = {
      ...newBar,
      date: newBar.date instanceof Date ? newBar.date : new Date(newBar.date),
    };

    const lastBar = existingBars[existingBars.length - 1] as any;
    let updatedBars;

    if (lastBar && lastBar.date.getTime() === (barToAdd.date as Date).getTime()) {
      updatedBars = [...existingBars.slice(0, -1), barToAdd];
    } else {
      updatedBars = [...existingBars, barToAdd];
    }

    await saveBars(symbol, timeframe, updatedBars);
  } catch (error) {
    console.error('[IndexedDB] Error appending bar:', error);
  }
}

export async function appendBars(symbol: string, timeframe: string, newBars: BarData[]): Promise<void> {
  try {
    const existingBars = (await getBars(symbol, timeframe)) || [];

    if (existingBars.length === 0) {
      await saveBars(symbol, timeframe, newBars);
      return;
    }

    const barsToAdd = newBars.map((bar: any) => ({
      ...bar,
      date: bar.date instanceof Date ? bar.date : new Date(bar.date),
    }));

    const lastCachedTime = (existingBars[existingBars.length - 1] as any).date.getTime();

    const uniqueNewBars = barsToAdd.filter(
      (bar: any) => bar.date.getTime() > lastCachedTime
    );

    if (uniqueNewBars.length === 0) {
      return;
    }

    const updatedBars = [...existingBars, ...uniqueNewBars];
    await saveBars(symbol, timeframe, updatedBars);
  } catch (error) {
    console.error('[IndexedDB] Error appending bars:', error);
  }
}

export async function getLastBarTimestamp(symbol: string, timeframe: string): Promise<number | null> {
  try {
    const bars = await getBars(symbol, timeframe);
    if (!bars || bars.length === 0) return null;

    const lastBar = bars[bars.length - 1] as any;
    return Math.floor(lastBar.date.getTime() / 1000);
  } catch (error) {
    console.error('[IndexedDB] Error getting last bar timestamp:', error);
    return null;
  }
}

export async function clearCache(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    console.log('[IndexedDB] Cache cleared');
  } catch (error) {
    console.error('[IndexedDB] Error clearing cache:', error);
  }
}
