/**

PATTERN: Per-API rate limit tracking with sliding ...
 */
import { asEmptyArray } from '../utils/safeDefaults.js';

type ApiName = 'google-calendar' | 'google-maps' | 'mls';

interface RateLimitConfig {
  requestsPerMinute: number;
}

interface RequestRecord {
  timestamp: number;
}

const rateLimitConfigs: Record<ApiName, RateLimitConfig> = {
  'google-calendar': {
    requestsPerMinute: parseInt(process.env.GOOGLE_CALENDAR_RATE_LIMIT_PER_MINUTE || '60', 10)
  },
  'google-maps': {
    requestsPerMinute: 60 // Default, can be configured via env var later
  },
  'mls': {
    requestsPerMinute: 60 // Default, can be configured via env var later
  }
};

const requestTimestamps: Map<ApiName, RequestRecord[]> = new Map();

function initializeApiStorage(apiName: ApiName): void {
  if (!requestTimestamps.has(apiName)) {
    requestTimestamps.set(apiName, []);
  }
}

/**
 * Clean old timestamps outside the sliding window
 */
function cleanOldTimestamps(apiName: ApiName): void {
  const timestamps = requestTimestamps.get(apiName);
  if (!timestamps) return;

  const oneMinuteAgo = Date.now() - 60000; // 60 seconds ago
  const filtered = timestamps.filter(record => record.timestamp > oneMinuteAgo);
  requestTimestamps.set(apiName, filtered);
}

type RateLimitStatus = 'available' | 'throttled' | 'exceeded';

interface RateLimitResult {
  status: RateLimitStatus;
  remainingRequests: number;
  resetTime: number; // Milliseconds until window resets
}

export function checkRateLimit(apiName: ApiName): RateLimitResult {
  initializeApiStorage(apiName);
  cleanOldTimestamps(apiName);

  const config = rateLimitConfigs[apiName];
  const timestamps = asEmptyArray(requestTimestamps.get(apiName));
  const currentCount = timestamps.length;

  // Calculate oldest timestamp in window (if any)
  const oldestTimestamp = timestamps.length > 0 
    ? Math.min(...timestamps.map(t => t.timestamp))
    : Date.now();
  const resetTime = oldestTimestamp + 60000 - Date.now(); // Time until oldest request expires

  if (currentCount >= config.requestsPerMinute) {
    return {
      status: 'exceeded',
      remainingRequests: 0,
      resetTime: Math.max(0, resetTime)
    };
  }

  const remainingRequests = config.requestsPerMinute - currentCount;
  const threshold = config.requestsPerMinute * 0.8; // 80% threshold for throttling

  if (currentCount >= threshold) {
    return {
      status: 'throttled',
      remainingRequests,
      resetTime: Math.max(0, resetTime)
    };
  }

  return {
    status: 'available',
    remainingRequests,
    resetTime: Math.max(0, resetTime)
  };
}

export function recordRequest(apiName: ApiName): void {
  initializeApiStorage(apiName);
  const timestamps = asEmptyArray(requestTimestamps.get(apiName));
  // @audit-allow:hardcoding:fieldMapping - Rate limit record shape
  timestamps.push({ timestamp: Date.now() });
  requestTimestamps.set(apiName, timestamps);
}

/**
 * Wait until rate limit allows request
 * @param apiName API name to wait for
 * @param maxWaitTime Maximum time to wait in milliseconds (default: 60 seconds)
 * @returns Promise that resolves when rate limit allows request
 */
export async function waitForRateLimit(
  apiName: ApiName,
  maxWaitTime: number = 60000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const result = checkRateLimit(apiName);
    
    if (result.status === 'available' || result.status === 'throttled') {
      return;
    }

    const waitTime = Math.min(result.resetTime, 1000);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  throw new Error(`Rate limit wait timeout for ${apiName}`);
}

export function getRateLimitStats(apiName: ApiName) {
  initializeApiStorage(apiName);
  cleanOldTimestamps(apiName);
  
  const config = rateLimitConfigs[apiName];
  const timestamps = asEmptyArray(requestTimestamps.get(apiName));
  
  return {
    apiName,
    requestsPerMinute: config.requestsPerMinute,
    currentRequests: timestamps.length,
    remainingRequests: config.requestsPerMinute - timestamps.length,
    utilizationPercent: (timestamps.length / config.requestsPerMinute) * 100
  };
}
