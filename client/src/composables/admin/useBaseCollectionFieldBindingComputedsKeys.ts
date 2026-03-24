/**
 * WHY: Top-level computed builders — identity / parent-key slice (file-cohesion: export split).
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { BaseCollectionFieldCoreState } from '@/composables/admin/useBaseCollectionFieldCore'

export function buildBaseCollectionChildEntityKeyComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(core: BaseCollectionFieldCoreState<GE, GF>): ComputedRef<GlobalEntityKey> {
  return computed<GlobalEntityKey>(() => {
    const cfg = core.selectConfig.value
    if (!cfg.candidateChildKey) {
      throw new Error(
        `[${core.name}] Missing candidateChildKey in inputConfig for ${String(core.fieldContext.state.entityKey)}.${String(core.fieldContext.state.fieldKey)}.`
      )
    }
    return cfg.candidateChildKey as GlobalEntityKey
  })
}

export function buildBaseCollectionRelationshipKeyComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(core: BaseCollectionFieldCoreState<GE, GF>): ComputedRef<string> {
  return computed<string>(() => {
    const cfg = core.selectConfig.value
    if (!cfg.targetKey) {
      throw new Error(
        `[${core.name}] Missing targetKey in inputConfig for ${String(core.fieldContext.state.entityKey)}.${String(core.fieldContext.state.fieldKey)}.`
      )
    }
    return cfg.targetKey as string
  })
}

export function buildBaseCollectionOptionsFieldKeyComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(core: BaseCollectionFieldCoreState<GE, GF>, relationshipKey: ComputedRef<string>): ComputedRef<string> {
  return computed<string>(() => core.config.resolveOptionsFieldKey(core.selectConfig.value, relationshipKey.value))
}

export function buildBaseCollectionParentEntityComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(core: BaseCollectionFieldCoreState<GE, GF>): ComputedRef<GlobalEntity<GE> | undefined> {
  return computed<GlobalEntity<GE> | undefined>(() =>
    core.adminComp.getEntity(core.fieldContext.state.entityKey, core.fieldContext.state.entityId)
  )
}

export function buildBaseCollectionParentTypePropertyComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(core: BaseCollectionFieldCoreState<GE, GF>): ComputedRef<string | null> {
  return computed<string | null>(() => core.config.resolveParentTypeProperty(core.fieldContext.state.entityKey))
}

export function buildBaseCollectionParentTypeEntityKeyComputed<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(core: BaseCollectionFieldCoreState<GE, GF>): ComputedRef<GlobalEntityKey | null> {
  return computed<GlobalEntityKey | null>(() =>
    core.config.resolveParentTypeEntityKey(core.fieldContext.state.entityKey)
  )
}
