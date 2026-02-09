/**
 * Google API Rate Limiter Wrapper
 * 
 * LEARNING: Wrapper function for rate limiting Google API calls
 * WHY: Provides consistent rate limiting pattern across all Google API services
 * PATTERN: Wraps API operations with rate limit checking and recording
 */

import { checkRateLimit, recordRequest, waitForRateLimit } from '../../rateLimiter.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('GoogleApiRateLimiter')

/**
 * API name type for rate limiting
 */
export type GoogleApiName = 'google-calendar' | 'google-maps'

/**
 * Execute an API operation with rate limiting
 * LEARNING: Wraps API calls with rate limit checking and recording
 * WHY: Ensures we don't exceed Google API quotas
 * PATTERN: Check → wait → record → execute
 * 
 * @param apiName - API name for rate limiting ('google-calendar' or 'google-maps')
 * @param operation - Async function to execute
 * @returns Promise with operation result
 */
export async function withRateLimit<T>(
  apiName: GoogleApiName,
  operation: () => Promise<T>
): Promise<T> {
  // Check rate limit
  const rateLimitResult = checkRateLimit(apiName)
  
  if (rateLimitResult.status === 'exceeded') {
    logger.warn(`Rate limit exceeded for ${apiName}, waiting...`)
    await waitForRateLimit(apiName)
  }
  
  // Record request for rate limiting
  recordRequest(apiName)
  
  // Execute operation
  return await operation()
}
