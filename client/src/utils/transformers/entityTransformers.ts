/**
 * PATTERN: Entity Transformers

PATTERN: Utility functions for entity transformatio...
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

/**
 * Transform API response to frontend format
 *
 * @param rawEntity - Raw entity from API (camelCase)
 * @param entityKey - Entity type key
 * @returns Transformed entity (camelCase)
 */
export function transformApiEntity<GE extends GlobalEntityKey>(
  rawEntity: Record<string, unknown>,
  entityKey: GE
): GlobalEntity<GE> {
  const skipKeys = new Set(['id', 'entity_key', 'descriptions', 'event_shape_attendees'])
  const entries = Object.entries(rawEntity).filter(([key]) => !skipKeys.has(key))
  const transformed: Record<string, unknown> = {
    id: rawEntity.id,
    entityKey,
    ...Object.fromEntries(entries),
  }
  return transformed as GlobalEntity<GE>
}


