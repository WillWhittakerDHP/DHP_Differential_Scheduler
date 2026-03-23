import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { RelationshipFieldType } from '@/types/entity/formFields'

/** Grouped to keep return surface under 10 (composable-health). */
export interface BaseCollectionFieldParentContext<GE extends GlobalEntityKey> {
  parentEntity: ComputedRef<GlobalEntity<GE> | null | undefined>
  parentTypeProperty: ComputedRef<string | null>
  parentTypeEntityKey: ComputedRef<GlobalEntityKey | null>
  parentTypeRef: ComputedRef<string | null>
  parentTypeEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>
}

export interface UseBaseCollectionFieldReturn<
  GE extends GlobalEntityKey,
  _GF extends GlobalFieldKey<GE>
> {
  childEntityKey: ComputedRef<GlobalEntityKey>
  relationshipKey: ComputedRef<string>
  optionsFieldKey: ComputedRef<string>
  parentContext: BaseCollectionFieldParentContext<GE>
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
