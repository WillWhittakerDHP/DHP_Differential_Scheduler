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
 * LEARNING: All models now use underscored: true, so API returns camelCase via Sequelize toJSON()
 * WHY: Sequelize automatically converts camelCase properties to snake_case columns, but toJSON() returns camelCase
 * PATTERN: Generic snake_case → camelCase converter as defensive fallback for any remaining snake_case fields
 * NOTE: Exported for use in useEntity composable to transform server responses
 * 
 * @param rawEntity - Raw entity from API (should be camelCase, but may have snake_case fields)
 * @param entityKey - Entity type key
 * @returns Transformed entity (camelCase)
 */
export function transformApiEntity<GE extends GlobalEntityKey>(
  rawEntity: Record<string, unknown>, 
  entityKey: GE
): GlobalEntity<GE> {
  function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  const transformed: Record<string, unknown> = {
    id: rawEntity.id,
    entityKey,
  }


  for (const [backendKey, value] of Object.entries(rawEntity)) {
    if (backendKey === 'id' || backendKey === 'entity_key' || backendKey === 'descriptions' || backendKey === 'event_shape_attendees') continue
    
    const frontendKey = snakeToCamel(backendKey)
    transformed[frontendKey] = value
  }

  /**
   * WHY: Field names are transformed at runtime, so type assertion is necessary
   * PATTERN: Cast through unknown first as TypeScript suggests for intentional type conversion
   */
  return transformed as unknown as GlobalEntity<GE>
}


