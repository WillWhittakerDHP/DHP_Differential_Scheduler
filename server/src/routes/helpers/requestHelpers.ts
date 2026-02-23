/**
 * Request param/query normalization
 *
 * as string | string[]; route handlers expect string for IDs and single values.
 */

import type { Request } from 'express'
import { asEmptyString } from '../../utils/safeDefaults.js'

/**
 * Return a single string for a route param (e.g. id, relationshipType).
 * If the value is an array (e.g. ?id=1&id=2), returns the first element.
 */
export function paramString(req: Request, key: string): string {
  const raw = req.params[key]
  return Array.isArray(raw) ? asEmptyString(raw[0]) : asEmptyString(raw)
}
