
import type { GlobalEntityKey } from '@/constants/entities'
import type { ValidAdminValue } from '@/constants/primitives'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'
import { accumulateDefaultsFromMetadataEntries } from '@/utils/admin/metadataDefaultsFromMetadata'

const logger = createLogger('entityDefaults')

const ENTITY_DISPLAY_NAMES: Record<GlobalEntityKey, string> = {
  blockInstance: 'Block Profile',
  blockShape: 'Block Shape',
  partInstance: 'Part Profile',
  partShape: 'Part Shape',
  eventShape: 'Event Shape',
  eventInstance: 'Event Profile',
  annotationShape: 'Annotation Shape',
  annotationInstance: 'Annotation Profile',
}

export function getEntityDisplayName(entityKey: GlobalEntityKey): string {
  return ENTITY_DISPLAY_NAMES[entityKey] ?? entityKey
}

function getDynamicEntityDefaults(entityKey: GlobalEntityKey): Record<string, ValidAdminValue> {
  const entityType = getEntityTypeForMetadata(entityKey)
  if (!entityType) {
    logger.warn(`No metadata entity type for entityKey: ${entityKey}`)
    return {}
  }

  let metadataCache
  try {
    metadataCache = useMetadataCache()
  } catch (error) {
    logger.error('Error calling useMetadataCache:', error)
    return { orderIndex: 0 }
  }

  let metadata
  try {
    metadata = metadataCache.getMetadata(entityType)
  } catch (error) {
    logger.error('Error calling getMetadata:', error)
    return { orderIndex: 0 }
  }

  if (!metadata || Object.keys(metadata).length === 0) {
    logger.warn(`Metadata not loaded for entityType: ${entityType}. Defaults may be incomplete.`)
  }

  const safeMeta = metadata !== undefined && metadata !== null ? metadata : {}
  return accumulateDefaultsFromMetadataEntries(safeMeta, entityType, logger)
}

export function getDefaultEntityValues(entityKey: GlobalEntityKey): Record<string, ValidAdminValue> {
  // PATTERN: Metadata is single source of truth for field types and required status
  const defaults = getDynamicEntityDefaults(entityKey)

  const result: Record<string, ValidAdminValue> = {
    ...defaults,
  } as Record<string, ValidAdminValue>

  // PATTERN: Use empty string so placeholder from display config is visible
  if (result.name === undefined) {
    result.name = ''
  }

  // PATTERN: Explicit check with fallback to 0 (defensive check even though metadata should include it)
  if (result.orderIndex === null || result.orderIndex === undefined) {
    result.orderIndex = 0
  }

  return result
}
