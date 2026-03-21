import type { Request } from 'express'
import Joi from 'joi'

const paramSchema = Joi.string().allow('')

export function paramString(req: Request, key: string): string {
  const raw = req.params[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  const result = paramSchema.validate(value)
  return result.error == null ? result.value : ''
}
