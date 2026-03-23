import { NODE_ENV } from '../constants/appConstants.js'

export function isProduction(): boolean {
  return process.env.NODE_ENV === NODE_ENV.PRODUCTION
}
