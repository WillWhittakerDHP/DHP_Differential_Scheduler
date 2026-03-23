
import { createLogger } from '@/utils/logger'

const logger = createLogger('transformerPrimitives')

function usedFallback(context: string | undefined, value: unknown, fallback: unknown): void {
  if (context !== undefined) {
    logger.debug(`[transformerPrimitives] fallback used`, { context, received: value, fallback })
  }
}

export function safeString(value: unknown, context?: string): string {
  if (typeof value === 'string') return value
  usedFallback(context, value, '')
  return ''
}

export function safeNumber(value: unknown, context?: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  usedFallback(context, value, 0)
  return 0
}

export function safeArray<ItemType>(value: readonly ItemType[] | ItemType[] | null | undefined): ItemType[] {
  if (Array.isArray(value)) return [...value]
  return []
}
