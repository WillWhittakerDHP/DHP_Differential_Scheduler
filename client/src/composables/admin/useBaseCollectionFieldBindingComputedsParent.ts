/**
 * WHY: Top-level computed builders — parent ref / display / assembly slice (file-cohesion: export split).
 */
import { computed, type ComputedRef } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { BaseCollectionFieldCoreState } from '@/composables/admin/useBaseCollectionFieldCore'
import type { BaseCollectionFieldParentContext } from '@/composables/admin/useBaseCollectionFieldTypes'
import { collectionFieldChildParentId } from '@/utils/admin/baseCollectionFieldChildParentId'

export function buildBaseCollectionParentTypeRefComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(
  core: BaseCollectionFieldCoreState<GE, GF>,
  parentEntity: ComputedRef<GlobalEntity<GE> | undefined>,
  parentTypeProperty: ComputedRef<string | null>
): ComputedRef<string | null> {
  return computed<string | null>(() =>
    core.config.resolveParentTypeRef(
      core.fieldContext.state.entityKey,
      core.fieldContext.state.entityId,
      parentEntity.value,
      parentTypeProperty.value
    )
  )
}

export function buildBaseCollectionParentTypeEntityComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(
  core: BaseCollectionFieldCoreState<GE, GF>,
  parentTypeEntityKey: ComputedRef<GlobalEntityKey | null>,
  parentTypeRef: ComputedRef<string | null>
): ComputedRef<GlobalEntity<GlobalEntityKey> | undefined> {
  return computed<GlobalEntity<GlobalEntityKey> | undefined>(() => {
    if (!parentTypeEntityKey.value || !parentTypeRef.value) return undefined
    return core.adminComp.getEntity(parentTypeEntityKey.value, toGlobalEntityId(parentTypeRef.value))
  })
}

export function buildBaseCollectionShouldDisplayComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(
  core: BaseCollectionFieldCoreState<GE, GF>,
  parentEntity: ComputedRef<GlobalEntity<GE> | undefined>,
  parentTypeProperty: ComputedRef<string | null>,
  parentTypeEntityKey: ComputedRef<GlobalEntityKey | null>,
  parentTypeRef: ComputedRef<string | null>,
  parentTypeEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>,
  optionsFieldKey: ComputedRef<string>
): ComputedRef<boolean> {
  return computed<boolean>(() =>
    core.config.resolveShouldDisplay({
      entityKey: core.fieldContext.state.entityKey,
      entityId: String(core.fieldContext.state.entityId),
      fieldKey: String(core.fieldContext.state.fieldKey),
      parentEntity: parentEntity.value,
      parentTypeProperty: parentTypeProperty.value,
      parentTypeEntityKey: parentTypeEntityKey.value,
      parentTypeRef: parentTypeRef.value,
      parentTypeEntity: parentTypeEntity.value,
      optionsFieldKey: String(optionsFieldKey.value),
    })
  )
}

export function buildBaseCollectionDefaultExpandedComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(core: BaseCollectionFieldCoreState<GE, GF>): ComputedRef<boolean | undefined> {
  return computed<boolean | undefined>(() => {
    const meta = core.fieldMetadataEntry.value
    return (meta as { defaultExpanded?: boolean })?.defaultExpanded
  })
}

export function buildBaseCollectionGetChildParentId<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(
  core: BaseCollectionFieldCoreState<GE, GF>,
  parentEntity: ComputedRef<GlobalEntity<GE> | undefined>,
  relationshipKey: ComputedRef<string>
): (child: GlobalEntity<GlobalEntityKey>) => string {
  return (child: GlobalEntity<GlobalEntityKey>): string =>
    collectionFieldChildParentId({
      composableName: core.name,
      entityKey: String(core.fieldContext.state.entityKey),
      entityId: String(core.fieldContext.state.entityId),
      fieldKey: String(core.fieldContext.state.fieldKey),
      parentEntity: parentEntity.value,
      relationshipKey: relationshipKey.value,
      child,
    })
}

export function assembleBaseCollectionParentContext<GE extends GlobalEntityKey>(
  parentEntity: ComputedRef<GlobalEntity<GE> | undefined>,
  parentTypeProperty: ComputedRef<string | null>,
  parentTypeEntityKey: ComputedRef<GlobalEntityKey | null>,
  parentTypeRef: ComputedRef<string | null>,
  parentTypeEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>
): BaseCollectionFieldParentContext<GE> {
  return {
    parentEntity,
    parentTypeProperty,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity,
  }
}
