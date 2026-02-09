/**
 * Router Response Helpers
 * 
 * LEARNING: Standardized response formatting utilities for all router operations
 * WHY: Eliminates duplication, provides consistent response shapes across all routers
 * PATTERN: Helper functions that wrap Express response methods with standardized formats
 */

import { Response } from 'express'
import { HTTP_STATUS_CODES } from '../../constants/router.js'

/**
 * Send a successful response with data
 * LEARNING: Standardized success response format
 * WHY: Consistent response structure, prevents magic numbers
 * PATTERN: Helper function that sets status and sends JSON
 * 
 * @param res - Express response object
 * @param data - Data to send in response body
 * @param statusCode - HTTP status code (defaults to 200 OK)
 */
export function sendSuccess(res: Response, data: unknown, statusCode: number = HTTP_STATUS_CODES.OK): void {
  res.status(statusCode).json(data)
}

/**
 * Send a created response (201)
 * LEARNING: Standardized created response format
 * WHY: Consistent response structure for POST operations
 * PATTERN: Helper function that sets 201 status and sends JSON
 * 
 * @param res - Express response object
 * @param data - Created resource data to send in response body
 */
export function sendCreated(res: Response, data: unknown): void {
  res.status(HTTP_STATUS_CODES.CREATED).json(data)
}

/**
 * Send a no content response (204)
 * LEARNING: Standardized no content response format
 * WHY: Consistent response structure for DELETE operations (HTTP-correct approach)
 * PATTERN: Helper function that sets 204 status and sends empty response
 * 
 * @param res - Express response object
 */
export function sendNoContent(res: Response): void {
  res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
}

/**
 * Send an error response
 * LEARNING: Standardized error response format
 * WHY: Consistent error structure, prevents magic numbers
 * PATTERN: Helper function that sets status and sends error JSON
 * 
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (defaults to 500)
 * @param details - Optional additional error details
 * @param id - Optional resource ID for error context
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  details?: string,
  id?: string
): void {
  const response: { error: string; details?: string; id?: string } = { error: message }
  
  if (details) {
    response.details = details
  }
  
  if (id) {
    response.id = id
  }
  
  res.status(statusCode).json(response)
}

/**
 * Send a not found response (404)
 * LEARNING: Standardized not found response format
 * WHY: Consistent response structure for missing resources
 * PATTERN: Helper function that sets 404 status and sends error JSON
 * 
 * @param res - Express response object
 * @param message - Error message
 * @param id - Optional resource ID for error context
 */
export function sendNotFound(res: Response, message: string, id?: string): void {
  sendError(res, message, HTTP_STATUS_CODES.NOT_FOUND, undefined, id)
}

/**
 * Send a bad request response (400)
 * LEARNING: Standardized bad request response format
 * WHY: Consistent response structure for validation errors
 * PATTERN: Helper function that sets 400 status and sends error JSON
 * 
 * @param res - Express response object
 * @param message - Error message
 * @param details - Optional validation error details
 * @param id - Optional resource ID for error context
 */
export function sendBadRequest(res: Response, message: string, details?: string, id?: string): void {
  sendError(res, message, HTTP_STATUS_CODES.BAD_REQUEST, details, id)
}
