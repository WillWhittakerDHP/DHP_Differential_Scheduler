
import { createLogger } from '@/utils/logger'

const logger = createLogger('safeDefaults')

export function asEmptyArray<T>(x: readonly T[] | null | undefined): T[] {
  if (x != null) return [...x]
  logger.debug('asEmptyArray fallback', { received: x })
  return []
}

export function asEmptyString(x: string | null | undefined): string {
  if (x != null) return x
  logger.debug('asEmptyString fallback', { received: x })
  return ''
}

export function asEmptyObject<ObjectType extends object>(
  x: ObjectType | null | undefined
): ObjectType {
  if (x != null) return x
  logger.debug('asEmptyObject fallback', { received: x })
  return {} as ObjectType
}
