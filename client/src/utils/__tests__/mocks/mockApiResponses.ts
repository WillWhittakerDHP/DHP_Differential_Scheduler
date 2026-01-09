/**
 * MOCK API RESPONSES
 * 
 * Reusable mock API response builders for testing.
 * Provides consistent response structures across tests.
 */

import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

/**
 * Success response wrapper
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  }
}

/**
 * Error response wrapper
 */
export function createErrorResponse(message: string, status: number = 400) {
  return {
    success: false,
    error: message,
    status,
  }
}

/**
 * Paginated response wrapper
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  perPage: number = 10,
  total: number = data.length
) {
  return {
    success: true,
    data,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  }
}

/**
 * Mock API response for GlobalData
 */
export function createGlobalDataResponse(globalData: GlobalData) {
  return createSuccessResponse(globalData)
}

/**
 * Mock validation error response
 */
export function createValidationErrorResponse(fields: Record<string, string>) {
  return {
    success: false,
    error: 'Validation failed',
    validationErrors: fields,
    status: 400,
  }
}

/**
 * Mock 404 response
 */
export function createNotFoundResponse(resource: string, id: string) {
  return createErrorResponse(`${resource} with id ${id} not found`, 404)
}

/**
 * Mock 500 response
 */
export function createServerErrorResponse(message: string = 'Internal server error') {
  return createErrorResponse(message, 500)
}

