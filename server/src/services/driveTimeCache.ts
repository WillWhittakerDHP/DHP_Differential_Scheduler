/**

PATTERN: Memory-efficient cache with TTL-based...
 */
import type { RouteLocation } from './google/maps/mapsTypes.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('DriveTimeCache');

interface DriveTimeCacheEntry {
  durationSeconds: number;
  distanceMeters: number;
  timestamp: number;
}

const cache: Map<string, DriveTimeCacheEntry> = new Map();

/**
WHY: Traffic patterns change, but basic route stru...
 */
const _DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds (reserved for future use)

const CACHE_TTL_HOURS = parseInt(process.env.DRIVE_TIME_CACHE_TTL_HOURS || '24', 10);
const TTL = CACHE_TTL_HOURS * 60 * 60 * 1000;

function locationToKey(location: RouteLocation): string {
  if (location.placeId) {
    return `pid:${location.placeId}`;
  }
  
  if (location.coordinates) {
    const lat = location.coordinates.lat.toFixed(4);
    const lng = location.coordinates.lng.toFixed(4);
    return `coord:${lat},${lng}`;
  }
  
  if (location.address) {
    const normalizedAddress = location.address
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
    return `addr:${normalizedAddress}`;
  }
  
  return 'unknown';
}

export function generateCacheKey(
  origin: RouteLocation,
  destination: RouteLocation
): string {
  const originKey = locationToKey(origin);
  const destKey = locationToKey(destination);
  return `${originKey}|${destKey}`;
}

function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp;
    if (age > TTL) {
      cache.delete(key);
    }
  }
}

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
    cache.delete(key);
    return null;
  }
  
  logger.debug(`Cache hit for ${key.substring(0, 50)}...`);
  return entry;
}

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
  
  logger.debug(`Cached drive time for ${key.substring(0, 50)}...`);
  
  if (cache.size % 10 === 0) {
    cleanExpiredEntries();
  }
}

export function clearDriveTimeCache(): void {
  cache.clear();
  logger.info('Cache cleared');
}

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

export function getAllCachedDriveTimes(): Map<string, DriveTimeCacheEntry> {
  cleanExpiredEntries();
  return new Map(cache);
}
