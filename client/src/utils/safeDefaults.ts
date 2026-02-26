import { buildCallsiteFrame } from '@shared/utils/loggerCore'
import { createLogger } from '@/utils/logger'

const logger = createLogger('safeDefaults')

const FALLBACK_SKIP_PATTERNS = ['safeDefaults.ts', 'loggerCore', 'logger.ts', 'main.ts']

function getCallerCallsite(): string {
  return buildCallsiteFrame(FALLBACK_SKIP_PATTERNS, new Error().stack)
}

export function asEmptyArray<T>(x: readonly T[] | null | undefined): T[] {
  if (x != null) return [...x]
  logger.warn('asEmptyArray fallback (misalignment)', { received: x, callsite: getCallerCallsite() })
  return []
}

export function asEmptyString(x: string | null | undefined): string {
  if (x != null) return x
  logger.warn('asEmptyString fallback (misalignment)', { received: x, callsite: getCallerCallsite() })
  return ''
}

export function asEmptyObject<ObjectType extends object>(
  x: ObjectType | null | undefined
): ObjectType {
  if (x != null) return x
  logger.warn('asEmptyObject fallback (misalignment)', { received: x, callsite: getCallerCallsite() })
  return {} as ObjectType
}
