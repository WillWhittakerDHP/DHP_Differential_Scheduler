/**
 * PATTERN: Base composable for collection field logic shared by usePartsCollectionField and useRelationshipCollectionField.
 * WHY: ~85% of both composables was identical; config object injects only the divergent parts (optionsFieldKey, parent type resolution, shouldDisplay).
 */
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { useEntityMetadata } from './useEntityMetadata'
import type { RelationshipFieldType } from '@/types/entity/formFields'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useBaseCollectionField')

export interface UseBaseCollectionFieldReturn<
  GE extends GlobalEntityKey,
  _GF extends GlobalFieldKey<GE>
> {
  childEntityKey: ComputedRef<GlobalEntityKey>
  relationshipKey: ComputedRef<string>
  optionsFieldKey: ComputedRef<string>
  parentEntity: ComputedRef<GlobalEntity<GE> | null | undefined>
  parentTypeProperty: ComputedRef<string | null>
  parentTypeEntityKey: ComputedRef<GlobalEntityKey | null>
  parentTypeRef: ComputedRef<string | null>
  parentTypeEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>
  shouldDisplay: ComputedRef<boolean>
  defaultExpanded: ComputedRef<boolean | undefined>
  getChildParentId: (child: GlobalEntity<GlobalEntityKey>) => string
  getParentId: (parent: GlobalEntity<GlobalEntityKey>) => string
}

/** Snapshot of values passed to config resolvers (read-only, current at call time). */
export interface CollectionFieldResolverContext<GE extends GlobalEntityKey> {
  entityKey: GE
  entityId: string
  fieldKey: string
  parentEntity: GlobalEntity<GE> | undefined
  parentTypeProperty: string | null
  parentTypeEntityKey: GlobalEntityKey | null
  parentTypeRef: string | null
  parentTypeEntity: GlobalEntity<GlobalEntityKey> | undefined
  optionsFieldKey: string
}

export interface CollectionFieldConfig<GE extends GlobalEntityKey, _GF extends GlobalFieldKey<GE>> {
  composableName: string
  resolveOptionsFieldKey: (
    selectConfig: RelationshipFieldType<GE>,
    relationshipKey: string
  ) => string
  resolveParentTypeProperty: (entityKey: GlobalEntityKey) => string | null
  resolveParentTypeEntityKey: (entityKey: GlobalEntityKey) => GlobalEntityKey | null
  resolveParentTypeRef: (
    entityKey: GlobalEntityKey,
    entityId: string,
    parentEntity: GlobalEntity<GE> | undefined,
    parentTypeProperty: string | null
  ) => string | null
  resolveShouldDisplay: (ctx: CollectionFieldResolverContext<GE>) => boolean
}

export function useBaseCollectionField<
  GE extends GlobalEntityKey,
  _GF extends GlobalFieldKey<GE>
>(
  fieldContext: FieldContextTypeGrouped<GE, _GF>,
  config: CollectionFieldConfig<GE, _GF>
): UseBaseCollectionFieldReturn<GE, _GF> {
  const adminComp = useAdmin()
  const name = config.composableName

  const entity = computed<GlobalEntity<GE> | null>(() => {
    try {
      const entityValue = adminComp.getEntity(fieldContext.state.entityKey, fieldContext.state.entityId)
      return entityValue ?? null
    } catch (err) {
      logger.warn('getEntity failed', { entityKey: fieldContext.state.entityKey, entityId: fieldContext.state.entityId, error: err })
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

  const childEntityKey = computed<GlobalEntityKey>(() => {
    const cfg = selectConfig.value
    if (!cfg.candidateChildKey) {
      throw new Error(
        `[${name}] Missing candidateChildKey in inputConfig for ${String(fieldContext.state.entityKey)}.${String(fieldContext.state.fieldKey)}.`
      )
    }
    return cfg.candidateChildKey as GlobalEntityKey
  })

  const relationshipKey = computed<string>(() => {
    const cfg = selectConfig.value
    if (!cfg.targetKey) {
      throw new Error(
        `[${name}] Missing targetKey in inputConfig for ${String(fieldContext.state.entityKey)}.${String(fieldContext.state.fieldKey)}.`
      )
    }
    return cfg.targetKey as string
  })

  const optionsFieldKey = computed<string>(() =>
    config.resolveOptionsFieldKey(selectConfig.value, relationshipKey.value)
  )

  const parentEntity = computed<GlobalEntity<GE> | undefined>(() =>
    adminComp.getEntity(fieldContext.state.entityKey, fieldContext.state.entityId)
  )

  const parentTypeProperty = computed<string | null>(() =>
    config.resolveParentTypeProperty(fieldContext.state.entityKey)
  )

  const parentTypeEntityKey = computed<GlobalEntityKey | null>(() =>
    config.resolveParentTypeEntityKey(fieldContext.state.entityKey)
  )

  const parentTypeRef = computed<string | null>(() =>
    config.resolveParentTypeRef(
      fieldContext.state.entityKey,
      fieldContext.state.entityId,
      parentEntity.value,
      parentTypeProperty.value
    )
  )

  const parentTypeEntity = computed<GlobalEntity<GlobalEntityKey> | undefined>(() => {
    if (!parentTypeEntityKey.value || !parentTypeRef.value) return undefined
    return adminComp.getEntity(parentTypeEntityKey.value, toGlobalEntityId(parentTypeRef.value))
  })

  const shouldDisplay = computed<boolean>(() =>
    config.resolveShouldDisplay({
      entityKey: fieldContext.state.entityKey,
      entityId: String(fieldContext.state.entityId),
      fieldKey: String(fieldContext.state.fieldKey),
      parentEntity: parentEntity.value,
      parentTypeProperty: parentTypeProperty.value,
      parentTypeEntityKey: parentTypeEntityKey.value,
      parentTypeRef: parentTypeRef.value,
      parentTypeEntity: parentTypeEntity.value,
      optionsFieldKey: String(optionsFieldKey.value),
    })
  )

  const defaultExpanded = computed<boolean | undefined>(() => {
    const meta = fieldMetadataEntry.value
    return (meta as { defaultExpanded?: boolean })?.defaultExpanded
  })

  const getChildParentId = (child: GlobalEntity<GlobalEntityKey>): string => {
    if (!parentEntity.value) {
      throw new Error(
        `[${name}] Missing parentEntity for ${String(fieldContext.state.entityKey)}.${String(fieldContext.state.entityId)}. Cannot determine child parent ID.`
      )
    }
    if (!relationshipKey.value) {
      throw new Error(
        `[${name}] Missing relationshipKey for ${String(fieldContext.state.entityKey)}.${String(fieldContext.state.fieldKey)}. Cannot determine child parent ID.`
      )
    }
    const parentRelationshipIds = getEntityFieldValue(parentEntity.value, String(relationshipKey.value))
    if (Array.isArray(parentRelationshipIds) && parentRelationshipIds.includes(child.id)) {
      return parentEntity.value.id
    }
    return ''
  }

  const getParentId = (parent: GlobalEntity<GlobalEntityKey>): string => parent.id

  return {
    childEntityKey,
    relationshipKey,
    optionsFieldKey,
    parentEntity,
    parentTypeProperty,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity,
    shouldDisplay,
    defaultExpanded,
    getChildParentId,
    getParentId,
  }
}
