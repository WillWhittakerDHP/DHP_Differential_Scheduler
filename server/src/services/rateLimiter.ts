/**
 * Rate Limiter Service
 * 
 * LEARNING: Sliding window rate limiting for external API calls
 * WHY: Google Calendar API enforces per-minute quotas (sliding window). Exceeding quotas returns 403/429 errors.
 * PATTERN: Per-API rate limit tracking with sliding window calculation matching Google's quota system
 * 
 * CRITICAL: Must be implemented before making API calls to prevent quota exhaustion
 */

type ApiName = 'google-calendar' | 'google-maps' | 'mls';

interface RateLimitConfig {
  requestsPerMinute: number;
}

interface RequestRecord {
  timestamp: number;
}

/**
 * Rate limit configuration per API
 * LEARNING: Configurable limits per API endpoint
 * WHY: Different APIs have different quota limits
 */
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

/**
 * Request timestamp storage per API
 * LEARNING: Map to track request timestamps for sliding window calculation
 * WHY: Need to track when requests were made to calculate requests per minute
 */
const requestTimestamps: Map<ApiName, RequestRecord[]> = new Map();

/**
 * Initialize request timestamp storage for API if not exists
 */
function initializeApiStorage(apiName: ApiName): void {
  if (!requestTimestamps.has(apiName)) {
    requestTimestamps.set(apiName, []);
  }
}

/**
 * Clean old timestamps outside the sliding window
 * LEARNING: Remove timestamps older than 1 minute to maintain sliding window
 * WHY: Only need to track requests within the current window
 */
function cleanOldTimestamps(apiName: ApiName): void {
  const timestamps = requestTimestamps.get(apiName);
  if (!timestamps) return;

  const oneMinuteAgo = Date.now() - 60000; // 60 seconds ago
  const filtered = timestamps.filter(record => record.timestamp > oneMinuteAgo);
  requestTimestamps.set(apiName, filtered);
}

/**
 * Rate limit status
 */
type RateLimitStatus = 'available' | 'throttled' | 'exceeded';

interface RateLimitResult {
  status: RateLimitStatus;
  remainingRequests: number;
  resetTime: number; // Milliseconds until window resets
}

/**
 * Check if API call is allowed based on rate limit
 * LEARNING: Sliding window rate limiting calculation
 * WHY: Matches Google's quota system which uses sliding window
 * @param apiName API name to check rate limit for
 * @returns Rate limit result with status and remaining requests
 */
export function checkRateLimit(apiName: ApiName): RateLimitResult {
  initializeApiStorage(apiName);
  cleanOldTimestamps(apiName);

  const config = rateLimitConfigs[apiName];
  const timestamps = requestTimestamps.get(apiName) || [];
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

/**
 * Record an API request
 * LEARNING: Add timestamp to sliding window
 * WHY: Track requests for rate limit calculation
 * @param apiName API name that made the request
 */
export function recordRequest(apiName: ApiName): void {
  initializeApiStorage(apiName);
  const timestamps = requestTimestamps.get(apiName) || [];
  timestamps.push({ timestamp: Date.now() });
  requestTimestamps.set(apiName, timestamps);
}

/**
 * Wait until rate limit allows request
 * LEARNING: Promise-based waiting for rate limit window
 * WHY: Allows queuing requests when rate limit is reached
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

    // Wait until reset time or 1 second, whichever is smaller
    const waitTime = Math.min(result.resetTime, 1000);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  throw new Error(`Rate limit wait timeout for ${apiName}`);
}

/**
 * Get rate limit statistics for an API
 * LEARNING: Useful for monitoring and debugging
 * @param apiName API name to get stats for
 * @returns Current rate limit statistics
 */
export function getRateLimitStats(apiName: ApiName) {
  initializeApiStorage(apiName);
  cleanOldTimestamps(apiName);
  
  const config = rateLimitConfigs[apiName];
  const timestamps = requestTimestamps.get(apiName) || [];
  
  return {
    apiName,
    requestsPerMinute: config.requestsPerMinute,
    currentRequests: timestamps.length,
    remainingRequests: config.requestsPerMinute - timestamps.length,
    utilizationPercent: (timestamps.length / config.requestsPerMinute) * 100
  };
}
