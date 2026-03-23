/**
 * WHY: Entity + metadata + selectConfig slice for useBaseCollectionField (complexity audit).
 */

import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import type { RelationshipFieldType } from '@/types/entity/formFields'
import { createLogger } from '@/utils/logger'
import type { CollectionFieldConfig } from '@/composables/admin/useBaseCollectionFieldTypes'

const logger = createLogger('useBaseCollectionFieldCore')

export interface BaseCollectionFieldCoreState<
  GE extends GlobalEntityKey,
  _GF extends GlobalFieldKey<GE>
> {
  adminComp: ReturnType<typeof useAdmin>
  name: string
  fieldContext: FieldContextTypeGrouped<GE, _GF>
  config: CollectionFieldConfig<GE, _GF>
  entity: ComputedRef<GlobalEntity<GE> | null>
  fieldMetadataEntry: ComputedRef<unknown>
  selectConfig: ComputedRef<RelationshipFieldType<GE>>
}

export function useBaseCollectionFieldCore<
  GE extends GlobalEntityKey,
  _GF extends GlobalFieldKey<GE>
>(
  fieldContext: FieldContextTypeGrouped<GE, _GF>,
  config: CollectionFieldConfig<GE, _GF>
): BaseCollectionFieldCoreState<GE, _GF> {
  const adminComp = useAdmin()
  const name = config.composableName

  const entity = computed<GlobalEntity<GE> | null>(() => {
    try {
      const entityValue = adminComp.getEntity(fieldContext.state.entityKey, fieldContext.state.entityId)
      return entityValue ?? null
    } catch (err) {
      logger.warn('getEntity failed', {
        entityKey: fieldContext.state.entityKey,
        entityId: fieldContext.state.entityId,
        error: err,
      })
      return null
    }
  })

  const { fieldMetadata } = useEntityMetadata(fieldContext.state.entityKey, entity)

  const fieldMetadataEntry = computed(() => {
    if (!fieldMetadata.value) return undefined
    return fieldMetadata.value[String(fieldContext.state.fieldKey)]
  })

  const selectConfig = computed<RelationshipFieldType<GE>>(() => {
    const meta = fieldMetadataEntry.value
    if (!meta) {
      throw new Error(
        `[${name}] Missing FieldMetadataEntry for ${String(fieldContext.state.entityKey)}.${String(fieldContext.state.fieldKey)}. ` +
          `Field must be configured in /admin-metadata.`
      )
    }
    if (!meta.inputConfig) {
      throw new Error(
        `[${name}] Missing inputConfig in FieldMetadataEntry for ${String(fieldContext.state.entityKey)}.${String(fieldContext.state.fieldKey)}. ` +
          `Collection fields must have inputConfig configured.`
      )
    }
    const cfg = meta.inputConfig as RelationshipFieldType<GE>
    if (cfg.targetMode !== 'relationship') {
      throw new Error(
        `[${name}] Invalid targetMode in inputConfig for ${String(fieldContext.state.entityKey)}.${String(fieldContext.state.fieldKey)}. ` +
          `Expected targetMode: 'relationship', got: ${String(cfg.targetMode)}.`
      )
    }
    return cfg
  })

  return { adminComp, name, fieldContext, config, entity, fieldMetadataEntry, selectConfig }
}
