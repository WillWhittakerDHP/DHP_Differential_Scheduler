/**
 * Google API Retry Utilities
 * 
 * LEARNING: Generalized retry logic for Google API operations
 * WHY: Handles transient errors (rate limits, network issues) automatically
 * PATTERN: Exponential backoff with jitter to prevent thundering herd
 */

import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('GoogleApiRetry')

/**
 * Retry configuration
 * LEARNING: Configurable retry behavior
 */
export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

/**
 * Default retry configuration
 * LEARNING: Sensible defaults for retry behavior
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,      // Start with 1 second
  maxDelayMs: 30000,         // Max 30 seconds
  backoffMultiplier: 2,      // Double each time
}

/**
 * Error type that indicates if an error is retryable
 * LEARNING: Interface for errors that can be retried
 */
interface RetryableError {
  retryable: boolean
  type?: string
  message: string
}

/**
 * Calculate delay for exponential backoff with jitter
 * LEARNING: Exponential backoff with jitter prevents thundering herd
 * WHY: Spreads out retry attempts to reduce load spikes
 * 
 * @param attempt - Current retry attempt (0-based)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  // Calculate base delay with exponential backoff
  const baseDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  )
  
  // Add jitter (±25%) to prevent thundering herd
  const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1)
  
  return Math.round(baseDelay + jitter)
}

/**
 * Execute operation with exponential backoff retry for transient errors
 * LEARNING: Generic retry wrapper for Google API operations
 * WHY: Handles transient errors automatically without code duplication
 * PATTERN: Only retries retryable errors, throws immediately for permanent errors
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
      
      // Check if error is retryable
      if (!isRetryable(error)) {
        const errorType = (error as RetryableError)?.type || 'unknown'
        logger.error('Non-retryable error', { errorType, message: (error as Error)?.message })
        throw error
      }
      
      // Don't retry if we've exhausted all attempts
      if (attempt >= retryConfig.maxRetries) {
        logger.error('All retries exhausted', { maxRetries: retryConfig.maxRetries })
        throw error
      }
      
      // Calculate and wait for backoff delay
      const delay = calculateBackoffDelay(attempt, retryConfig)
      const errorType = (error as RetryableError)?.type || 'unknown'
      logger.warn('Retrying after delay', {
        attempt: attempt + 1,
        maxRetries: retryConfig.maxRetries,
        delayMs: delay,
        errorType
      })
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // Should never reach here, but TypeScript needs this
  throw lastError || new Error('Retry failed')
}
