/**
 * NOT FOUND MIDDLEWARE TESTS
 * 
 * Unit tests for notFound middleware.
 * Tests 404 response for unknown routes.
 * Phase 4C: Integration Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { Request, Response, NextFunction } from 'express'
import { notFound } from '../notFound'

describe('notFound', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/api/unknown/route',
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  it('should set status to 404', () => {
    notFound(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockResponse.status).toHaveBeenCalledWith(404)
  })

  it('should call next with error containing original URL', () => {
    notFound(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockNext).toHaveBeenCalled()
    const error = (mockNext as jest.Mock).mock.calls[0][0]
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Not Found - /api/unknown/route')
  })

  it('should include original URL in error message', () => {
    mockRequest.originalUrl = '/api/entities/invalid'
    
    notFound(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    const error = (mockNext as jest.Mock).mock.calls[0][0]
    expect(error.message).toBe('Not Found - /api/entities/invalid')
  })

  it('should handle root path', () => {
    mockRequest.originalUrl = '/'
    
    notFound(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    const error = (mockNext as jest.Mock).mock.calls[0][0]
    expect(error.message).toBe('Not Found - /')
  })

  it('should handle query parameters in URL', () => {
    mockRequest.originalUrl = '/api/entities?filter=test'
    
    notFound(
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    const error = (mockNext as jest.Mock).mock.calls[0][0]
    expect(error.message).toBe('Not Found - /api/entities?filter=test')
  })
})

