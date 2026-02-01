
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  }
}

export function createErrorResponse(message: string, status: number = 400) {
  return {
    success: false,
    error: message,
    status,
  }
}

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

export function createGlobalDataResponse(globalData: GlobalData) {
  return createSuccessResponse(globalData)
}

export function createValidationErrorResponse(fields: Record<string, string>) {
  return {
    success: false,
    error: 'Validation failed',
    validationErrors: fields,
    status: 400,
  }
}

export function createNotFoundResponse(resource: string, id: string) {
  return createErrorResponse(`${resource} with id ${id} not found`, 404)
}

export function createServerErrorResponse(message: string = 'Internal server error') {
  return createErrorResponse(message, 500)
}

