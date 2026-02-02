/**
 * Calendar Events Cache Service
 * 
 * LEARNING: TTL-based caching for Google Calendar full event responses with locations
 * WHY: Reduces API calls and provides event location data for drive time calculations
 * PATTERN: Memory-efficient cache with TTL-based expiration, following freeBusyCache pattern
 * 
 * CRITICAL: Cache reduces API calls and enables location-based features (drive time buffers)
 */

/**
 * Cached calendar event structure
 * LEARNING: Minimal event data needed for drive time calculations
 * WHY: Only cache essential fields to reduce memory usage
 * PATTERN: Uses placeId as primary location identifier (address only at UI boundary)
 * 
 * Session 2.2.3: Updated to use placeId instead of location string
 */
export interface CachedCalendarEvent {
  id: string;
  start: string;
  end: string;
  placeId?: string;        // Google Place ID (primary location identifier)
  summary: string | null;   // Event title for context/debugging
}

interface EventsCacheEntry {
  data: CachedCalendarEvent[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Cache storage
 * LEARNING: Map-based cache with TTL entries
 * WHY: Simple, memory-efficient cache implementation
 */
const cache: Map<string, EventsCacheEntry> = new Map();

/**
 * Default TTL values in milliseconds
 * LEARNING: Different TTLs for near-term vs future dates
 * WHY: Near-term dates change more frequently, need shorter cache
 */
const DEFAULT_TTL_NEAR_TERM = 5 * 60 * 1000; // 5 minutes for next 7 days
const DEFAULT_TTL_FUTURE = 15 * 60 * 1000; // 15 minutes for dates beyond 7 days

/**
 * Configuration from environment
 */
const CACHE_TTL_MINUTES = parseInt(process.env.GOOGLE_CALENDAR_CACHE_TTL_MINUTES || '5', 10);
const DEFAULT_TTL = CACHE_TTL_MINUTES * 60 * 1000; // Convert minutes to milliseconds

/**
 * Generate cache key from calendar email and time range
 * LEARNING: Normalized cache key for consistent lookups
 * WHY: Same calendar + time range should always produce same key
 * @param calendarEmail Calendar email address
 * @param timeMin Start time (ISO string or Date)
 * @param timeMax End time (ISO string or Date)
 * @returns Cache key string
 */
function generateCacheKey(
  calendarEmail: string,
  timeMin: string | Date,
  timeMax: string | Date
): string {
  // Normalize calendar email (lowercase and trim)
  const normalizedEmail = calendarEmail.toLowerCase().trim();
  
  // Normalize time strings
  const normalizedTimeMin = typeof timeMin === 'string' ? timeMin : timeMin.toISOString();
  const normalizedTimeMax = typeof timeMax === 'string' ? timeMax : timeMax.toISOString();
  
  return `events:${normalizedEmail}:${normalizedTimeMin}:${normalizedTimeMax}`;
}

/**
 * Determine TTL based on date range
 * LEARNING: Shorter TTL for near-term dates, longer for future dates
 * WHY: Near-term calendar data changes more frequently
 * @param timeMin Start time
 * @param timeMax End time
 * @returns TTL in milliseconds
 */
function getTTL(timeMin: string | Date, timeMax: string | Date): number {
  const now = Date.now();
  const minTime = typeof timeMin === 'string' ? new Date(timeMin).getTime() : timeMin.getTime();
  const maxTime = typeof timeMax === 'string' ? new Date(timeMax).getTime() : timeMax.getTime();
  
  // Check if any part of the range is within next 7 days
  const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
  const isNearTerm = minTime < sevenDaysFromNow || maxTime < sevenDaysFromNow;
  
  return isNearTerm ? DEFAULT_TTL_NEAR_TERM : DEFAULT_TTL_FUTURE;
}

/**
 * Clean expired cache entries
 * LEARNING: Remove entries that have exceeded their TTL
 * WHY: Prevent memory leaks and ensure fresh data
 */
function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp;
    if (age > entry.ttl) {
      cache.delete(key);
    }
  }
}

/**
 * Get cached calendar events
 * LEARNING: Check cache before making API call
 * WHY: Reduces API calls and improves performance
 * @param calendarEmail Calendar email address
 * @param timeMin Start time
 * @param timeMax End time
 * @returns Cached events if available and not expired, null otherwise
 */
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
    // Entry expired, remove it
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Cache calendar events
 * LEARNING: Store API response in cache with TTL
 * WHY: Enable future cache hits for same queries
 * @param calendarEmail Calendar email address
 * @param timeMin Start time
 * @param timeMax End time
 * @param events Events data to cache
 */
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
  
  // Clean expired entries periodically (every 10th cache write)
  if (cache.size % 10 === 0) {
    cleanExpiredEntries();
  }
}

/**
 * Invalidate cache for specific calendar
 * LEARNING: Remove cache entries when calendar data changes
 * WHY: Ensure fresh data after events are created/modified
 * @param calendarEmail Calendar email address to invalidate
 * @param timeRange Optional time range to invalidate (if not provided, invalidates all)
 */
export function invalidateEventsCache(
  calendarEmail?: string,
  timeRange?: { timeMin: string | Date; timeMax: string | Date }
): void {
  if (calendarEmail && timeRange) {
    // Invalidate specific time range
    const key = generateCacheKey(calendarEmail, timeRange.timeMin, timeRange.timeMax);
    cache.delete(key);
  } else if (calendarEmail) {
    // Invalidate all entries for this calendar
    const normalizedEmail = calendarEmail.toLowerCase().trim();
    for (const key of cache.keys()) {
      if (key.includes(normalizedEmail)) {
        cache.delete(key);
      }
    }
  } else {
    // Invalidate all entries
    cache.clear();
  }
}

/**
 * Clear all cache entries
 * LEARNING: Useful for testing or manual cache clearing
 * WHY: Allows complete cache reset
 * 
 * IMPORTANT: Cache should be cleared when deploying changes that modify CachedCalendarEvent structure
 * (e.g., Session 2.2.3: Changed from location:string to placeId:string)
 */
export function clearEventsCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 * LEARNING: Useful for monitoring cache performance
 * @returns Cache statistics
 */
export function getEventsCacheStats() {
  cleanExpiredEntries();
  
  return {
    totalEntries: cache.size,
    memoryUsage: cache.size * 2048, // Rough estimate (2KB per entry - events are larger than free-busy)
    hitRate: 0 // Would need to track hits/misses for accurate rate
  };
}

/**
 * Get all cached entries (for debugging)
 * LEARNING: Returns all cache entries for inspection
 * WHY: Useful for dev panel to display cache contents
 * @returns Map of cache keys to entries
 */
export function getAllCachedEntries(): Map<string, EventsCacheEntry> {
  cleanExpiredEntries();
  return new Map(cache);
}
