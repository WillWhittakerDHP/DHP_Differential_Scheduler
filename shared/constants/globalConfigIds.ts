/**
 * Shared Global Config IDs and Sentinel UUIDs
 *
 * LEARNING: Single source of truth for sentinel UUIDs used by admin metadata and entity type mapping
 * WHY: Consistent identification across frontend and backend; eliminates magic UUID strings
 * PATTERN: Const object and NULL_UUID for placeholder/temporary entity checks
 *
 * Phase: Constants Consolidation Refactor
 */

/** Placeholder UUID used for temporary/new entities (rejected by server on update) */
export const NULL_UUID = '00000000-0000-0000-0000-000000000000' as const

/**
 * Sentinel UUIDs for global configuration metadata (entity-type-wide metadata)
 * LEARNING: Admin metadata uses these to identify global config per entity type
 * WHY: Same constants on frontend and backend for consistency
 */
export const GLOBAL_CONFIG_IDS = {
  BLOCK_SHAPE: '00000000-0000-0000-0000-000000000001',
  PART_SHAPE: '00000000-0000-0000-0000-000000000002',
  PART_INSTANCE: '00000000-0000-0000-0000-000000000003',
  BLOCK_INSTANCE: '00000000-0000-0000-0000-000000000004',
  EVENT_SHAPE: '00000000-0000-0000-0000-000000000010',
  ANNOTATION_SHAPE: '00000000-0000-0000-0000-000000000011',
  EVENT_INSTANCE: '00000000-0000-0000-0000-000000000012',
  ANNOTATION_INSTANCE: '00000000-0000-0000-0000-000000000013',
} as const
