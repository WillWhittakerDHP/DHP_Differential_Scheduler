
import { describe, it, expect, beforeEach } from '@jest/globals'
import { Request, Response, NextFunction } from 'express'
import { errorHandler } from '../errorHandler'

describe('errorHandler', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      statusCode: 500,
    }
    mockNext = jest.fn()
  })

  it('should send error response with message and status', () => {
    const error = new Error('Test error message')
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Test error message',
      status: 500,
      stack: expect.any(String),
    })
  })

  it('should use response statusCode if available', () => {
    const error = new Error('Test error')
    mockResponse.statusCode = 404
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockResponse.status).toHaveBeenCalledWith(404)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Test error',
      status: 404,
      stack: expect.any(String),
    })
  })

  it('should default to 500 if statusCode not set', () => {
    const error = new Error('Test error')
    mockResponse.statusCode = undefined
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockResponse.status).toHaveBeenCalledWith(500)
  })

  it('should include stack trace in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at test.js:1:1'
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Test error',
      status: 500,
      stack: 'Error: Test error\n    at test.js:1:1',
    })
    
    process.env.NODE_ENV = originalEnv
  })

  it('should hide stack trace in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at test.js:1:1'
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Test error',
      status: 500,
      stack: '🥞',
    })
    
    process.env.NODE_ENV = originalEnv
  })

  it('should handle errors without stack trace', () => {
    const error = new Error('Test error')
    delete (error as any).stack
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Test error',
      status: 500,
      stack: undefined,
    })
  })

  it('should handle non-Error objects', () => {
    const error = { message: 'Custom error' } as any
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext as NextFunction
    )

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Custom error',
      status: 500,
      stack: undefined,
    })
  })
})

