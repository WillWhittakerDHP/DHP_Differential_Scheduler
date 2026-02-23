/**
 * PATTERN: Property Enrichment Cache
PATTERN: Same pattern as driveTimeCache.ts
 */
import type { PropertyEnrichmentResponse } from '../types/brightMls.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('PropertyEnrichmentCache');

export interface PropertyEnrichmentCacheEntry {
  data: PropertyEnrichmentResponse;
  timestamp: number;
}

const cache = new Map<string, PropertyEnrichmentCacheEntry>();

const CACHE_TTL_MINUTES = parseInt(
  process.env.PROPERTY_ENRICHMENT_CACHE_TTL_MINUTES || '60',
  10
);
const TTL = CACHE_TTL_MINUTES * 60 * 1000;

/**
 * Normalize address for cache key
 */
export function normalizeAddressForCache(address: string): string {
  return address
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[,#]/g, '');
}

function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > TTL) {
      cache.delete(key);
    }
  }
}

export function getCachedEnrichment(
  normalizedAddress: string
): PropertyEnrichmentResponse | null {
  cleanExpiredEntries();
  const entry = cache.get(normalizedAddress);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(normalizedAddress);
    return null;
  }
  logger.debug(`Property enrichment cache hit for ${normalizedAddress.substring(0, 40)}...`);
  return entry.data;
}

export function cacheEnrichment(
  normalizedAddress: string,
  data: PropertyEnrichmentResponse
): void {
  cache.set(normalizedAddress, {
    data,
    timestamp: Date.now(),
  });
  logger.debug(`Cached property enrichment for ${normalizedAddress.substring(0, 40)}...`);
  if (cache.size % 10 === 0) {
    cleanExpiredEntries();
  }
}
