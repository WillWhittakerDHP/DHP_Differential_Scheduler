/**
 * Free-Busy Cache Service
 * 
 * LEARNING: TTL-based caching for Google Calendar free-busy responses
 * WHY: Reduces API calls significantly (same calendar + time range = cache hit)
 * PATTERN: Memory-efficient cache with TTL-based expiration
 * 
 * CRITICAL: Cache reduces API calls and prevents quota exhaustion
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Cache storage
 * LEARNING: Map-based cache with TTL entries
 * WHY: Simple, memory-efficient cache implementation
 */
const cache: Map<string, CacheEntry> = new Map();

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
 * Generate cache key from calendar emails and time range
 * LEARNING: Normalized cache key for consistent lookups
 * WHY: Same calendar + time range should always produce same key
 * @param calendarEmails Array of calendar email addresses
 * @param timeMin Start time (ISO string or Date)
 * @param timeMax End time (ISO string or Date)
 * @returns Cache key string
 */
function generateCacheKey(
  calendarEmails: string[],
  timeMin: string | Date,
  timeMax: string | Date
): string {
  // Normalize calendar emails (sort and lowercase)
  const normalizedEmails = [...calendarEmails]
    .map(email => email.toLowerCase().trim())
    .sort()
    .join(',');
  
  // Normalize time strings
  const normalizedTimeMin = typeof timeMin === 'string' ? timeMin : timeMin.toISOString();
  const normalizedTimeMax = typeof timeMax === 'string' ? timeMax : timeMax.toISOString();
  
  return `freebusy:${normalizedEmails}:${normalizedTimeMin}:${normalizedTimeMax}`;
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
 * Get cached free-busy data
 * LEARNING: Check cache before making API call
 * WHY: Reduces API calls and improves performance
 * @param calendarEmails Array of calendar email addresses
 * @param timeMin Start time
 * @param timeMax End time
 * @returns Cached data if available and not expired, null otherwise
 */
export function getCachedFreeBusy(
  calendarEmails: string[],
  timeMin: string | Date,
  timeMax: string | Date
): any | null {
  cleanExpiredEntries();
  
  const key = generateCacheKey(calendarEmails, timeMin, timeMax);
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
 * Cache free-busy data
 * LEARNING: Store API response in cache with TTL
 * WHY: Enable future cache hits for same queries
 * @param calendarEmails Array of calendar email addresses
 * @param timeMin Start time
 * @param timeMax End time
 * @param data Free-busy data to cache
 */
export function cacheFreeBusy(
  calendarEmails: string[],
  timeMin: string | Date,
  timeMax: string | Date,
  data: any
): void {
  const key = generateCacheKey(calendarEmails, timeMin, timeMax);
  const ttl = getTTL(timeMin, timeMax);
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
  
  // Clean expired entries periodically (every 10th cache write)
  if (cache.size % 10 === 0) {
    cleanExpiredEntries();
  }
}

/**
 * Invalidate cache for specific calendars
 * LEARNING: Remove cache entries when calendar data changes
 * WHY: Ensure fresh data after appointments are created/modified
 * @param calendarEmails Array of calendar email addresses to invalidate
 */
export function invalidateCache(calendarEmails: string[]): void {
  const normalizedEmails = [...calendarEmails]
    .map(email => email.toLowerCase().trim())
    .sort()
    .join(',');
  
  // Remove all cache entries that match these calendars
  for (const key of cache.keys()) {
    if (key.includes(normalizedEmails)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache entries
 * LEARNING: Useful for testing or manual cache clearing
 * WHY: Allows complete cache reset
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 * LEARNING: Useful for monitoring cache performance
 * @returns Cache statistics
 */
export function getCacheStats() {
  cleanExpiredEntries();
  
  return {
    totalEntries: cache.size,
    memoryUsage: cache.size * 1024, // Rough estimate (1KB per entry)
    hitRate: 0 // Would need to track hits/misses for accurate rate
  };
}
