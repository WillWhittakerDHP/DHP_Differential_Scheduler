/**
 * Centralized safe defaults for null/undefined; fallback use is logged.
 */

import { createLogger } from './logger.js';

const logger = createLogger('safeDefaults');

/**
 * Return the value or empty array when null/undefined; log when fallback is used.
 */
export function asEmptyArray<T>(x: T[] | null | undefined): T[] {
  if (x != null) return x;
  logger.debug('asEmptyArray fallback', { received: x });
  return [];
}

/**
 * Return the value or empty string when null/undefined; log when fallback is used.
 */
export function asEmptyString(x: string | null | undefined): string {
  if (x != null) return x;
  logger.debug('asEmptyString fallback', { received: x });
  return '';
}

/**
 * Return the value or empty object when null/undefined; log when fallback is used.
 */
export function asEmptyObject<K extends string, V>(
  x: Record<K, V> | null | undefined
): Record<K, V> {
  if (x != null) return x;
  logger.debug('asEmptyObject fallback', { received: x });
  return {} as Record<K, V>;
}
