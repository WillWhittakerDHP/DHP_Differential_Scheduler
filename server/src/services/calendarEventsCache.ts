/**

PATTERN: Memory-efficient cache with TTL-...
 */
import type { CalendarEvent } from '../../../shared/types/availabilityTypes.js'

export type CachedCalendarEvent = CalendarEvent & { readonly __brand: 'Cached' }

export interface EventsCacheEntry {
  data: CachedCalendarEvent[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const cache: Map<string, EventsCacheEntry> = new Map();

const DEFAULT_TTL_NEAR_TERM = 5 * 60 * 1000; // 5 minutes for next 7 days
const DEFAULT_TTL_FUTURE = 15 * 60 * 1000; // 15 minutes for dates beyond 7 days

const CACHE_TTL_MINUTES = parseInt(process.env.GOOGLE_CALENDAR_CACHE_TTL_MINUTES || '5', 10);
const _DEFAULT_TTL = CACHE_TTL_MINUTES * 60 * 1000; // Convert minutes to milliseconds (reserved for future use)

function generateCacheKey(
  calendarEmail: string,
  timeMin: string | Date,
  timeMax: string | Date
): string {
  const normalizedEmail = calendarEmail.toLowerCase().trim();
  
  const normalizedTimeMin = typeof timeMin === 'string' ? timeMin : timeMin.toISOString();
  const normalizedTimeMax = typeof timeMax === 'string' ? timeMax : timeMax.toISOString();
  
  return `events:${normalizedEmail}:${normalizedTimeMin}:${normalizedTimeMax}`;
}

function getTTL(timeMin: string | Date, timeMax: string | Date): number {
  const now = Date.now();
  const minTime = typeof timeMin === 'string' ? new Date(timeMin).getTime() : timeMin.getTime();
  const maxTime = typeof timeMax === 'string' ? new Date(timeMax).getTime() : timeMax.getTime();
  
  const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
  const isNearTerm = minTime < sevenDaysFromNow || maxTime < sevenDaysFromNow;
  
  return isNearTerm ? DEFAULT_TTL_NEAR_TERM : DEFAULT_TTL_FUTURE;
}

function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp;
    if (age > entry.ttl) {
      cache.delete(key);
    }
  }
}

export function getCachedEvents(
  calendarEmail: string,
  timeMin: string | Date,
  timeMax: string | Date
): CachedCalendarEvent[] | null {
  cleanExpiredEntries();
  
  const key = generateCacheKey(calendarEmail, timeMin, timeMax);
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  
  if (age > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function cacheEvents(
  calendarEmail: string,
  timeMin: string | Date,
  timeMax: string | Date,
  events: CachedCalendarEvent[]
): void {
  const key = generateCacheKey(calendarEmail, timeMin, timeMax);
  const ttl = getTTL(timeMin, timeMax);
  
  cache.set(key, {
    data: events,
    timestamp: Date.now(),
    ttl
  });
  
  if (cache.size % 10 === 0) {
    cleanExpiredEntries();
  }
}

export function invalidateEventsCache(
  calendarEmail?: string,
  timeRange?: { timeMin: string | Date; timeMax: string | Date }
): void {
  if (calendarEmail && timeRange) {
    const key = generateCacheKey(calendarEmail, timeRange.timeMin, timeRange.timeMax);
    cache.delete(key);
  } else if (calendarEmail) {
    const normalizedEmail = calendarEmail.toLowerCase().trim();
    for (const key of cache.keys()) {
      if (key.includes(normalizedEmail)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

export function getEventsCacheStats() {
  cleanExpiredEntries();
  
  return {
    totalEntries: cache.size,
    memoryUsage: cache.size * 2048, // Rough estimate (2KB per entry - events are larger than free-busy)
    hitRate: 0 // Would need to track hits/misses for accurate rate
  };
}

export function getAllCachedEntries(): Map<string, EventsCacheEntry> {
  cleanExpiredEntries();
  return new Map(cache);
}
