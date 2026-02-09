/**
 * Address Geocoding Cache Service
 * 
 * LEARNING: TTL-based caching for address → placeId geocoding results
 * WHY: Addresses don't change, so geocoding results can be cached for a long time
 * PATTERN: Memory-efficient cache with TTL-based expiration, following driveTimeCache pattern
 * 
 * CRITICAL: Cache reduces Google Places API calls - addresses are geocoded once and reused
 */

/**
 * Cached geocoding entry
 * LEARNING: Stores placeId result (or null if not found) with timestamp
 */
export interface AddressGeocodingCacheEntry {
  placeId: string | null;  // null means address was geocoded but no placeId found
  timestamp: number;
}

/**
 * Cache storage
 * LEARNING: Map-based cache with TTL entries
 */
const cache: Map<string, AddressGeocodingCacheEntry> = new Map();

/**
 * Default TTL: 30 days
 * LEARNING: Addresses don't change, so geocoding results are stable
 * WHY: Long TTL reduces API calls while still allowing for address corrections
 */
const DEFAULT_TTL_DAYS = 30;
const DEFAULT_TTL = DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Configuration from environment
 */
const CACHE_TTL_DAYS = parseInt(process.env.ADDRESS_GEOCODING_CACHE_TTL_DAYS || String(DEFAULT_TTL_DAYS), 10);
const TTL = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

/**
 * Normalize address for cache key
 * 
 * LEARNING: Normalize address to consistent key format
 * WHY: Same address specified different ways should hit same cache entry
 * PATTERN: lowercase, trim, remove extra spaces (same as driveTimeCache)
 * 
 * @param address Address string to normalize
 * @returns Normalized address string
 */
export function normalizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return ''
  }
  
  // Normalize address: lowercase, trim, remove extra spaces
  return address
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Clean expired cache entries
 * LEARNING: Remove entries that have exceeded their TTL
 * WHY: Prevent memory leaks and ensure fresh data
 */
function cleanExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp
    if (age > TTL) {
      cache.delete(key)
    }
  }
}

/**
 * Get cached placeId for address
 * 
 * LEARNING: Check cache before making API call
 * WHY: Reduces API calls and improves performance
 * 
 * @param address Address string to look up
 * @returns Cached placeId if available and not expired, undefined if expired/missing, null if cached as "not found"
 */
export function getCachedPlaceId(address: string): string | null | undefined {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return undefined
  }
  
  cleanExpiredEntries()
  
  const normalizedAddress = normalizeAddress(address)
  const entry = cache.get(normalizedAddress)
  
  if (!entry) {
    return undefined  // Cache miss
  }
  
  const now = Date.now()
  const age = now - entry.timestamp
  
  if (age > TTL) {
    // Entry expired, remove it
    cache.delete(normalizedAddress)
    return undefined  // Expired, treat as cache miss
  }
  
  // Cache hit - return cached result (could be string or null)
  return entry.placeId
}

/**
 * Cache placeId for address
 * 
 * LEARNING: Store geocoding result in cache
 * WHY: Enable future cache hits for same address
 * 
 * @param address Address string to cache
 * @param placeId PlaceId result (or null if not found)
 */
export function cachePlaceId(address: string, placeId: string | null): void {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return
  }
  
  const normalizedAddress = normalizeAddress(address)
  
  cache.set(normalizedAddress, {
    placeId,
    timestamp: Date.now()
  })
  
  // Clean expired entries periodically (every 10th cache write)
  if (cache.size % 10 === 0) {
    cleanExpiredEntries()
  }
}

/**
 * Clear all cache entries
 * LEARNING: Useful for testing or manual cache clearing
 * WHY: Allows complete cache reset
 */
export function clearGeocodingCache(): void {
  cache.clear()
}

/**
 * Get cache statistics
 * LEARNING: Useful for monitoring cache performance
 * @returns Cache statistics
 */
export function getGeocodingCacheStats(): {
  totalEntries: number
  oldestEntryAge: number | null
  memoryEstimateBytes: number
} {
  cleanExpiredEntries()
  
  let oldestTimestamp: number | null = null
  for (const entry of cache.values()) {
    if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp
    }
  }
  
  const oldestEntryAge = oldestTimestamp !== null 
    ? Math.round((Date.now() - oldestTimestamp) / 1000 / 60 / 60 / 24) // in days
    : null
  
  return {
    totalEntries: cache.size,
    oldestEntryAge,
    memoryEstimateBytes: cache.size * 150 // Rough estimate per entry
  }
}

/**
 * Get all cached entries (for debugging)
 * LEARNING: Returns all cache entries for inspection
 * WHY: Useful for dev panel to display cache contents
 * @returns Map of cache keys to entries
 */
export function getAllCachedGeocodings(): Map<string, AddressGeocodingCacheEntry> {
  cleanExpiredEntries()
  return new Map(cache)
}
