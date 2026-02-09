/**
 * Drive Time Cache Service
 * 
 * LEARNING: TTL-based caching for Routes API drive time calculations
 * WHY: Same routes don't change often, caching reduces API calls and costs
 * PATTERN: Memory-efficient cache with TTL-based expiration, following calendarEventsCache pattern
 * 
 * SESSION: 2.2.2 - Drive Time Calculations (Routes API)
 * 
 * CRITICAL: Cache reduces API calls - Routes API charges per element
 */

import type { RouteLocation } from './google/maps/mapsTypes.js';

/**
 * Cached drive time entry
 * LEARNING: Minimal data needed for drive time results
 */
export interface DriveTimeCacheEntry {
  durationSeconds: number;
  distanceMeters: number;
  timestamp: number;
}

/**
 * Cache storage
 * LEARNING: Map-based cache with TTL entries
 */
const cache: Map<string, DriveTimeCacheEntry> = new Map();

/**
 * Default TTL: 24 hours
 * LEARNING: Routes don't change often, 24 hour cache is reasonable
 * WHY: Traffic patterns change, but basic route structure is stable
 */
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Configuration from environment
 */
const CACHE_TTL_HOURS = parseInt(process.env.DRIVE_TIME_CACHE_TTL_HOURS || '24', 10);
const TTL = CACHE_TTL_HOURS * 60 * 60 * 1000;

/**
 * Generate location key for cache
 * 
 * LEARNING: Normalize location to consistent key format
 * WHY: Same location specified different ways should hit same cache entry
 * PATTERN: Priority: placeId > coordinates (rounded) > address
 * 
 * @param location Location to generate key for
 * @returns Normalized location key
 */
function locationToKey(location: RouteLocation): string {
  if (location.placeId) {
    // Place ID is most precise - use as-is
    return `pid:${location.placeId}`;
  }
  
  if (location.coordinates) {
    // Round coordinates to 4 decimal places (~11m precision)
    // This allows nearby points to share cache entries
    const lat = location.coordinates.lat.toFixed(4);
    const lng = location.coordinates.lng.toFixed(4);
    return `coord:${lat},${lng}`;
  }
  
  if (location.address) {
    // Normalize address: lowercase, trim, remove extra spaces
    const normalizedAddress = location.address
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
    return `addr:${normalizedAddress}`;
  }
  
  return 'unknown';
}

/**
 * Generate cache key from origin and destination
 * 
 * LEARNING: Combine origin and destination keys
 * WHY: Drive time depends on both endpoints
 * 
 * @param origin Origin location
 * @param destination Destination location
 * @returns Cache key string
 */
export function generateCacheKey(
  origin: RouteLocation,
  destination: RouteLocation
): string {
  const originKey = locationToKey(origin);
  const destKey = locationToKey(destination);
  return `${originKey}|${destKey}`;
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
    if (age > TTL) {
      cache.delete(key);
    }
  }
}

/**
 * Get cached drive time for origin-destination pair
 * 
 * LEARNING: Check cache before making API call
 * WHY: Reduces API calls and improves performance
 * 
 * @param origin Origin location
 * @param destination Destination location
 * @returns Cached entry if available and not expired, null otherwise
 */
export function getCachedDriveTime(
  origin: RouteLocation,
  destination: RouteLocation
): DriveTimeCacheEntry | null {
  cleanExpiredEntries();
  
  const key = generateCacheKey(origin, destination);
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  
  if (age > TTL) {
    // Entry expired, remove it
    cache.delete(key);
    return null;
  }
  
  console.log(`[DriveTimeCache] Cache hit for ${key.substring(0, 50)}...`);
  return entry;
}

/**
 * Cache drive time for origin-destination pair
 * 
 * LEARNING: Store API response in cache
 * WHY: Enable future cache hits for same queries
 * 
 * @param origin Origin location
 * @param destination Destination location
 * @param durationSeconds Drive time in seconds
 * @param distanceMeters Distance in meters
 */
export function cacheDriveTime(
  origin: RouteLocation,
  destination: RouteLocation,
  durationSeconds: number,
  distanceMeters: number
): void {
  const key = generateCacheKey(origin, destination);
  
  cache.set(key, {
    durationSeconds,
    distanceMeters,
    timestamp: Date.now()
  });
  
  console.log(`[DriveTimeCache] Cached drive time for ${key.substring(0, 50)}...`);
  
  // Clean expired entries periodically (every 10th cache write)
  if (cache.size % 10 === 0) {
    cleanExpiredEntries();
  }
}

/**
 * Invalidate all cache entries
 * LEARNING: Clear entire cache
 * WHY: Useful for testing or manual cache clearing
 */
export function clearDriveTimeCache(): void {
  cache.clear();
  console.log('[DriveTimeCache] Cache cleared');
}

/**
 * Get cache statistics
 * LEARNING: Useful for monitoring cache performance
 * @returns Cache statistics
 */
export function getDriveTimeCacheStats(): {
  totalEntries: number;
  oldestEntryAge: number | null;
  memoryEstimateBytes: number;
} {
  cleanExpiredEntries();
  
  let oldestTimestamp: number | null = null;
  for (const entry of cache.values()) {
    if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp;
    }
  }
  
  const oldestEntryAge = oldestTimestamp !== null 
    ? Math.round((Date.now() - oldestTimestamp) / 1000 / 60) // in minutes
    : null;
  
  return {
    totalEntries: cache.size,
    oldestEntryAge,
    memoryEstimateBytes: cache.size * 200 // Rough estimate per entry
  };
}

/**
 * Get all cached entries (for debugging)
 * LEARNING: Returns all cache entries for inspection
 * WHY: Useful for dev panel to display cache contents
 * @returns Map of cache keys to entries
 */
export function getAllCachedDriveTimes(): Map<string, DriveTimeCacheEntry> {
  cleanExpiredEntries();
  return new Map(cache);
}
