/**
 * Calendar Error Handler
 * 
 * LEARNING: Centralized error handling for Google Calendar API operations
 * WHY: Provides typed errors, exponential backoff retry, and graceful degradation
 * PATTERN: Error classification with retry strategies and fallback behavior
 * 
 * SESSION: 2.1.5 - Error Handling & Fallbacks
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('CalendarErrorHandler');

/**
 * Calendar API error types
 * LEARNING: Discriminated union for different error scenarios
 * WHY: Allows type-safe handling of different error cases
 */
export type CalendarErrorType = 
  | 'auth'           // 401 - Authentication failed
  | 'permission'     // 403 - Permission denied (scope issues)
  | 'rateLimit'      // 429 or 403 with rate limit - Too many requests
  | 'notFound'       // 404 - Calendar or event not found
  | 'network'        // Network error (ECONNREFUSED, ETIMEDOUT, etc.)
  | 'timeout'        // Request timeout
  | 'invalid'        // Invalid request/response
  | 'unknown';       // Unknown error

/**
 * Calendar API Error Class
 * LEARNING: Typed error class with metadata for error handling
 * WHY: Enables type-safe error handling and consistent error responses
 */
export class CalendarApiError extends Error {
  public readonly type: CalendarErrorType;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly originalError?: Error;
  
  constructor(
    type: CalendarErrorType,
    message: string,
    options?: {
      statusCode?: number;
      retryable?: boolean;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'CalendarApiError';
    this.type = type;
    this.statusCode = options?.statusCode;
    this.retryable = options?.retryable ?? false;
    this.originalError = options?.originalError;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CalendarApiError);
    }
  }
  
  /**
   * Create user-friendly error message
   * LEARNING: Maps technical errors to user-friendly messages
   * WHY: Users shouldn't see technical error details
   */
  getUserMessage(): string {
    switch (this.type) {
      case 'auth':
        return 'Calendar authentication failed. Please reconnect your Google Calendar.';
      case 'permission':
        return 'Calendar access denied. Please check calendar permissions.';
      case 'rateLimit':
        return 'Too many calendar requests. Please try again in a moment.';
      case 'notFound':
        return 'Calendar not found or not accessible.';
      case 'network':
        return 'Could not reach Google Calendar service. Please check your connection.';
      case 'timeout':
        return 'Calendar request timed out. Please try again.';
      case 'invalid':
        return 'Invalid calendar request or response.';
      default:
        return 'An unexpected calendar error occurred.';
    }
  }
}

/**
 * Classify error from Google API response
 * LEARNING: Maps Google API errors to our typed errors
 * WHY: Consistent error handling regardless of Google's error format
 */
export function classifyError(error: any): CalendarApiError {
  // Network errors (no response received)
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return new CalendarApiError('network', `Network error: ${error.code}`, {
      retryable: true,
      originalError: error,
    });
  }
  
  // Timeout errors
  if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
    return new CalendarApiError('timeout', 'Request timed out', {
      retryable: true,
      originalError: error,
    });
  }
  
  // HTTP status code errors
  const statusCode = error.code || error.status || error.response?.status;
  
  if (statusCode === 401) {
    return new CalendarApiError('auth', 'Authentication failed', {
      statusCode: 401,
      retryable: false,
      originalError: error,
    });
  }
  
  if (statusCode === 403) {
    // Distinguish between permission and rate limit
    const message = error.message?.toLowerCase() || '';
    if (message.includes('rate') || message.includes('quota') || message.includes('limit')) {
      return new CalendarApiError('rateLimit', 'Rate limit exceeded', {
        statusCode: 403,
        retryable: true,
        originalError: error,
      });
    }
    return new CalendarApiError('permission', 'Permission denied', {
      statusCode: 403,
      retryable: false,
      originalError: error,
    });
  }
  
  if (statusCode === 404) {
    return new CalendarApiError('notFound', 'Resource not found', {
      statusCode: 404,
      retryable: false,
      originalError: error,
    });
  }
  
  if (statusCode === 429) {
    return new CalendarApiError('rateLimit', 'Rate limit exceeded', {
      statusCode: 429,
      retryable: true,
      originalError: error,
    });
  }
  
  if (statusCode >= 500) {
    return new CalendarApiError('unknown', `Server error: ${statusCode}`, {
      statusCode,
      retryable: true,  // Server errors are usually transient
      originalError: error,
    });
  }
  
  // Unknown error
  return new CalendarApiError('unknown', error.message || 'Unknown error', {
    statusCode,
    retryable: false,
    originalError: error,
  });
}

/**
 * Exponential backoff configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,      // Start with 1 second
  maxDelayMs: 30000,         // Max 30 seconds
  backoffMultiplier: 2,      // Double each time
};

/**
 * Calculate delay for exponential backoff
 * LEARNING: Exponential backoff with jitter prevents thundering herd
 * WHY: Spreads out retry attempts to reduce load spikes
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  // Calculate base delay with exponential backoff
  const baseDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );
  
  // Add jitter (±25%) to prevent thundering herd
  const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.round(baseDelay + jitter);
}

/**
 * Execute function with exponential backoff retry
 * LEARNING: Generic retry wrapper for any async operation
 * WHY: Handles transient errors automatically without code duplication
 * 
 * @param operation - Async function to execute
 * @param config - Retry configuration (optional)
 * @returns Promise with operation result
 * @throws CalendarApiError if all retries fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: CalendarApiError | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const classifiedError = error instanceof CalendarApiError 
        ? error 
        : classifyError(error);
      
      lastError = classifiedError;
      
      // Don't retry non-retryable errors
      if (!classifiedError.retryable) {
        logger.error(`Non-retryable error (${classifiedError.type}):`, classifiedError.message);
        throw classifiedError;
      }
      
      // Don't retry if we've exhausted all attempts
      if (attempt >= retryConfig.maxRetries) {
        logger.error(`All ${retryConfig.maxRetries} retries exhausted`);
        throw classifiedError;
      }
      
      // Calculate and wait for backoff delay
      const delay = calculateBackoffDelay(attempt, retryConfig);
      logger.warn(
        `Retry ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms ` +
        `(error: ${classifiedError.type})`
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Should never reach here, but TypeScript needs this
  throw lastError || new CalendarApiError('unknown', 'Retry failed');
}

/**
 * Result type for operations with fallback
 * LEARNING: Indicates whether result is fresh or from cache
 * WHY: Caller needs to know if data might be stale
 */
export interface FallbackResult<T> {
  data: T;
  source: 'fresh' | 'cache' | 'empty';
  error?: CalendarApiError;
}

/**
 * Execute operation with cache fallback
 * LEARNING: Graceful degradation - return cached data when API fails
 * WHY: Better to show potentially stale data than nothing
 * 
 * @param operation - Async function to execute
 * @param getCached - Function to get cached data
 * @param defaultValue - Default value if no cache available
 * @returns FallbackResult with data and source indicator
 */
export async function withFallback<T>(
  operation: () => Promise<T>,
  getCached: () => T | null,
  defaultValue: T
): Promise<FallbackResult<T>> {
  try {
    const data = await operation();
    return { data, source: 'fresh' };
  } catch (error: any) {
    const classifiedError = error instanceof CalendarApiError 
      ? error 
      : classifyError(error);
    
    logger.warn(
      `Operation failed (${classifiedError.type}), checking cache fallback`
    );
    
    // Try to return cached data
    const cachedData = getCached();
    if (cachedData !== null) {
      logger.info('Returning cached data as fallback');
      return { 
        data: cachedData, 
        source: 'cache',
        error: classifiedError,
      };
    }
    
    // No cache available - return default value
    logger.warn('No cache available, returning default value');
    return { 
      data: defaultValue, 
      source: 'empty',
      error: classifiedError,
    };
  }
}

/**
 * Log error with context
 * LEARNING: Consistent error logging format
 * WHY: Makes debugging easier with structured logs
 */
export function logCalendarError(
  context: string,
  error: CalendarApiError,
  additionalInfo?: Record<string, any>
): void {
  logger.error(`${context} Calendar API Error:`, {
    type: error.type,
    message: error.message,
    statusCode: error.statusCode,
    retryable: error.retryable,
    ...additionalInfo,
  });
  
  if (error.originalError) {
    logger.error(`${context} Original error:`, error.originalError);
  }
}
