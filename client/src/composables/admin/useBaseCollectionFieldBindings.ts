/**
 * WHY: Relationship + parent context computeds for useBaseCollectionField (complexity audit).
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { UseBaseCollectionFieldReturn } from '@/composables/admin/useBaseCollectionFieldTypes'
import type { BaseCollectionFieldCoreState } from '@/composables/admin/useBaseCollectionFieldCore'
import {
  assembleBaseCollectionParentContext,
  buildBaseCollectionChildEntityKeyComputed,
  buildBaseCollectionDefaultExpandedComputed,
  buildBaseCollectionGetChildParentId,
  buildBaseCollectionOptionsFieldKeyComputed,
  buildBaseCollectionParentEntityComputed,
  buildBaseCollectionParentTypeEntityComputed,
  buildBaseCollectionParentTypeEntityKeyComputed,
  buildBaseCollectionParentTypePropertyComputed,
  buildBaseCollectionParentTypeRefComputed,
  buildBaseCollectionRelationshipKeyComputed,
  buildBaseCollectionShouldDisplayComputed,
} from '@/composables/admin/useBaseCollectionFieldBindingComputeds'

export function useBaseCollectionFieldBindings<
  GE extends GlobalEntityKey,
  _GF extends GlobalFieldKey<GE>
>(core: BaseCollectionFieldCoreState<GE, _GF>): UseBaseCollectionFieldReturn<GE, _GF> {
  const childEntityKey = buildBaseCollectionChildEntityKeyComputed(core)
  const relationshipKey = buildBaseCollectionRelationshipKeyComputed(core)
  const optionsFieldKey = buildBaseCollectionOptionsFieldKeyComputed(core, relationshipKey)
  const parentEntity = buildBaseCollectionParentEntityComputed(core)
  const parentTypeProperty = buildBaseCollectionParentTypePropertyComputed(core)
  const parentTypeEntityKey = buildBaseCollectionParentTypeEntityKeyComputed(core)
  const parentTypeRef = buildBaseCollectionParentTypeRefComputed(core, parentEntity, parentTypeProperty)
  const parentTypeEntity = buildBaseCollectionParentTypeEntityComputed(core, parentTypeEntityKey, parentTypeRef)
  const shouldDisplay = buildBaseCollectionShouldDisplayComputed(
    core,
    parentEntity,
    parentTypeProperty,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity,
    optionsFieldKey
  )
  const defaultExpanded = buildBaseCollectionDefaultExpandedComputed(core)
  const getChildParentId = buildBaseCollectionGetChildParentId(core, parentEntity, relationshipKey)

  return {
    childEntityKey,
    relationshipKey,
    optionsFieldKey,
    parentContext: assembleBaseCollectionParentContext(
      parentEntity,
      parentTypeProperty,
      parentTypeEntityKey,
      parentTypeRef,
      parentTypeEntity
    ),
    shouldDisplay,
    defaultExpanded,
    getChildParentId,
    getParentId: (parent: GlobalEntity<GlobalEntityKey>): string => parent.id,
  }
}
