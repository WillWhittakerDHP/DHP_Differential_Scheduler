import type { GlobalEntityKey } from '@/constants/entities'

/**
 * LEARNING: Config-driven entity type names
 * WHY: Eliminates entityKey branching (if/else chains) - single source of truth
 * PATTERN: Record mapping entityKey to display name
 */
const ENTITY_TYPE_NAMES: Record<GlobalEntityKey, string> = {
  blockShape: 'BlockShape',
  partShape: 'PartShape',
  blockInstance: 'BlockInstance',
  partInstance: 'PartInstance',
}

/**
 * LEARNING: Config-driven entity type labels (plural forms for admin UI)
 * WHY: Provides plural labels for admin panels (e.g., "Block Shapes" vs "Block Shape")
 * PATTERN: Record mapping entityKey to plural display label
 */
const ENTITY_TYPE_LABELS: Record<GlobalEntityKey, string> = {
  blockShape: 'Block Shapes',
  partShape: 'Part Shapes',
  blockInstance: 'Block Instance',
  partInstance: 'Part Instance',
}

/**
 * Get entity type name (singular, PascalCase)
 * LEARNING: Config-driven instead of if/else chain
 * WHY: Eliminates hardcoding, single source of truth
 * PATTERN: Lookup from config record
 */
export function getEntityTypeName(entityKey: GlobalEntityKey): string {
  return ENTITY_TYPE_NAMES[entityKey] ?? entityKey
}

/**
 * Get entity type label (plural form for admin UI)
 * LEARNING: Config-driven instead of if/else chain
 * WHY: Eliminates hardcoding, single source of truth
 * PATTERN: Lookup from config record
 */
export function getEntityTypeLabel(entityKey: GlobalEntityKey): string {
  return ENTITY_TYPE_LABELS[entityKey] ?? entityKey
}

export function getEntitySuccessMessage(entityKey: GlobalEntityKey): string {
  return `${getEntityTypeName(entityKey)} updated successfully`
}

export function getEntityDeleteTitle(entityKey: GlobalEntityKey): string {
  return `Delete ${getEntityTypeName(entityKey)}`
}


