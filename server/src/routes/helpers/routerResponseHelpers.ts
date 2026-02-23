/**

LEARNING: Standardized response formatting util...
 */
import { Response } from 'express'
import { HTTP_STATUS_CODES } from '../../constants/router.js'

export function sendSuccess(res: Response, data: unknown, statusCode: number = HTTP_STATUS_CODES.OK): void {
  res.status(statusCode).json(data)
}

export function sendCreated(res: Response, data: unknown): void {
  res.status(HTTP_STATUS_CODES.CREATED).json(data)
}

export function sendNoContent(res: Response): void {
  res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
}

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

export function sendNotFound(res: Response, message: string, id?: string): void {
  sendError(res, message, HTTP_STATUS_CODES.NOT_FOUND, undefined, id)
}

export function sendBadRequest(res: Response, message: string, details?: string, id?: string): void {
  sendError(res, message, HTTP_STATUS_CODES.BAD_REQUEST, details, id)
}
