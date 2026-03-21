/**

PATTERN: Memory-efficient cache with TT...
 */
interface AddressGeocodingCacheEntry {
  placeId: string | null;  // null means address was geocoded but no placeId found
  timestamp: number;
}

const cache: Map<string, AddressGeocodingCacheEntry> = new Map();

const DEFAULT_TTL_DAYS = 30;
const _DEFAULT_TTL = DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000; // 30 days in milliseconds (reserved for future use)

const CACHE_TTL_DAYS = parseInt(process.env.ADDRESS_GEOCODING_CACHE_TTL_DAYS || String(DEFAULT_TTL_DAYS), 10);
const TTL = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

export function normalizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return ''
  }
  
  return address
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function cleanExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp
    if (age > TTL) {
      cache.delete(key)
    }
  }
}

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
    cache.delete(normalizedAddress)
    return undefined  // Expired, treat as cache miss
  }
  
  return entry.placeId
}

export function cachePlaceId(address: string, placeId: string | null): void {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return
  }
  
  const normalizedAddress = normalizeAddress(address)
  
  cache.set(normalizedAddress, {
    placeId,
    timestamp: Date.now()
  })
  
  if (cache.size % 10 === 0) {
    cleanExpiredEntries()
  }
}
