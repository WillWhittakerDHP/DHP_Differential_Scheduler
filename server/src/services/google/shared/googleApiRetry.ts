
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('GoogleApiRetry')

export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,      // Start with 1 second
  maxDelayMs: 30000,         // Max 30 seconds
  backoffMultiplier: 2,      // Double each time
}

interface RetryableError {
  retryable: boolean
  type?: string
  message: string
}

function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const baseDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  )
  
  const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1)
  
  return Math.round(baseDelay + jitter)
}

/**
 * Execute operation with exponential backoff retry for transient errors
 * 
 * @param operation - Async function to execute
 * @param isRetryable - Function to check if error is retryable
 * @param config - Retry configuration (optional)
 * @returns Promise with operation result
 * @throws Error if all retries fail or error is not retryable
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  isRetryable: (error: unknown) => boolean,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: unknown = null
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: unknown) {
      lastError = error
      
      if (!isRetryable(error)) {
        const rawType = (error as RetryableError)?.type
        const errorType = rawType !== undefined && rawType !== null && rawType !== '' ? rawType : 'unknown'
        logger.error('Non-retryable error', { errorType, message: (error as Error)?.message })
        throw error
      }
      
      if (attempt >= retryConfig.maxRetries) {
        logger.error('All retries exhausted', { maxRetries: retryConfig.maxRetries })
        throw error
      }
      
      const delay = calculateBackoffDelay(attempt, retryConfig)
      const rawTypeRetry = (error as RetryableError)?.type
      const errorType = rawTypeRetry !== undefined && rawTypeRetry !== null && rawTypeRetry !== '' ? rawTypeRetry : 'unknown'
      logger.warn('Retrying after delay', {
        attempt: attempt + 1,
        maxRetries: retryConfig.maxRetries,
        delayMs: delay,
        errorType
      })
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError || new Error('Retry failed')
}
