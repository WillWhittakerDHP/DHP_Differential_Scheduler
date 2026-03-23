import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import type { UseFieldComponentOptions } from '@/types/admin/fieldComponent'
import { getFieldComponent } from '@/utils/forms/fieldComponentDispatcher'
import { createLogger } from '@/utils/logger'

const logger = createLogger('fieldComponentResolve')

export function unwrapMaybeRefKey<T>(key: T | { value: T }): T {
  return key instanceof Object && 'value' in key ? (key as { value: T }).value : key
}

export function resolveProvidedEntity(
  providedEntity: UseFieldComponentOptions['entity']
): GlobalEntity<GlobalEntityKey> | null {
  if (!providedEntity) {
    return null
  }
  if ('value' in providedEntity && typeof providedEntity.value === 'object') {
    return providedEntity.value as GlobalEntity<GlobalEntityKey> | null
  }
  return providedEntity as GlobalEntity<GlobalEntityKey> | null
}

export function resolveComponentTypeFromFieldContext<GE extends GlobalEntityKey>(params: {
  entityKey: GE | undefined
  fieldKey: GlobalFieldKey<GE> | undefined
  fieldMetadataEntry: FieldMetadataEntry | undefined
}): ReturnType<typeof getFieldComponent<GE>> {
  const { entityKey, fieldKey, fieldMetadataEntry } = params

  if (!fieldKey) {
    const result = { type: 'unknown' as const, reason: 'notConfigured' as const }
    if (entityKey !== undefined && entityKey !== null) {
      logger.warn('Unknown component type - missing fieldKey', {
        entityKey,
        fieldKey,
        fieldMetadataEntry,
        reason: result.reason,
      })
    }
    return result
  }

  if (!entityKey) {
    const result = { type: 'unknown' as const, reason: 'notConfigured' as const }
    logger.warn('Unknown component type - missing entityKey', {
      entityKey,
      fieldKey,
      fieldMetadataEntry,
      reason: result.reason,
    })
    return result
  }

  const result = getFieldComponent(entityKey, fieldKey, fieldMetadataEntry)
  if (result.type === 'unknown') {
    logger.warn('Unknown component type determined', {
      entityKey,
      fieldKey,
      fieldMetadataEntry,
      componentType: result.type,
      reason: result.reason,
    })
  }
  return result
}
