
import { checkRateLimit, recordRequest, waitForRateLimit } from '../../rateLimiter.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('GoogleApiRateLimiter')

export type GoogleApiName = 'google-calendar' | 'google-maps'

/**
 * Execute an API operation with rate limiting
 * 
 * @param apiName - API name for rate limiting ('google-calendar' or 'google-maps')
 * @param operation - Async function to execute
 * @returns Promise with operation result
 */
export async function withRateLimit<T>(
  apiName: GoogleApiName,
  operation: () => Promise<T>
): Promise<T> {
  const rateLimitResult = checkRateLimit(apiName)
  
  if (rateLimitResult.status === 'exceeded') {
    logger.warn(`Rate limit exceeded for ${apiName}, waiting...`)
    await waitForRateLimit(apiName)
  }
  
  recordRequest(apiName)
  
  return await operation()
}
