/**
 * Entity Transformers
 * 
 * LEARNING: Common utilities for entity transformation
 * WHY: DRY principle - shared logic for all entity operations
 * PATTERN: Utility functions for entity transformation, following annotationTransformers pattern
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

/**
 * Transform API response to frontend format
 * LEARNING: All models use underscored: true; Sequelize toJSON() returns camelCase
 * PATTERN: Spread raw entity as-is (no snake_case conversion)
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


