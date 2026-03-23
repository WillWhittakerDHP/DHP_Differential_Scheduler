/**
 */
import { computed, ref, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormContext } from 'vee-validate'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { SUB_PANEL_KEYS, type SubPanelRecord } from '@/constants/fieldMetadata'
import type RelationshipCollection from '@/components/admin/generic/collections/RelationshipCollection.vue'
import { blockShapeDisplayNameForBlockInstance } from '@/utils/admin/entityCardBlockShapeDisplayName'
import {
  buildPartsSummaryForSubPanel,
  buildRelationshipTypesForSubPanel,
  formatTruncatedList,
} from '@/utils/admin/entityCardSubPanelSummaries'
import {
  getEntityNamesForCard,
  getPartShapeNamesForCard,
} from '@/utils/admin/entityCardSubPanelEntityNames'
import { isEntityCardRelationshipCollectionField } from '@/utils/admin/entityCardRelationshipCollectionField'
import {
  callPartsCollectionToggleBulkEdit,
  firstPartsCollectionInstance,
  readBulkEditModeFromPartsCollection,
} from '@/utils/admin/partsCollectionInstanceHelpers'

type RelationshipCollectionRef = InstanceType<typeof RelationshipCollection>
type PartsCollectionRefValue = (RelationshipCollectionRef)[] | RelationshipCollectionRef | null

function togglePartsBulkEditModeForCard(
  partsCollectionRef: Ref<PartsCollectionRefValue>,
  expandedPanels: Ref<string[]>,
  scheduleAfterPaint: (fn: () => void) => void
): void {
  const instance = firstPartsCollectionInstance(partsCollectionRef.value)
  if (!expandedPanels.value.includes('parts')) {
    expandedPanels.value.push('parts')
    scheduleAfterPaint(() => {
      callPartsCollectionToggleBulkEdit(firstPartsCollectionInstance(partsCollectionRef.value))
    })
  } else {
    callPartsCollectionToggleBulkEdit(instance)
  }
}

function ensurePartsPanelExpandedWhenBulkEnabled(isEnabled: boolean, expandedPanels: Ref<string[]>): void {
  if (isEnabled && !expandedPanels.value.includes('parts')) {
    expandedPanels.value.push('parts')
  }
}

export type SubPanelFields = SubPanelRecord<GlobalFieldKey<GlobalEntityKey>[]>

interface UseEntityCardSubPanelsOptions {
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  form: FormContext
  subPanelFields: SubPanelFields
  getFieldContext: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  fieldMetadata?: Record<string, FieldMetadataEntry>
}

export interface UseEntityCardSubPanelsReturn {
  blockShapeName: import('vue').ComputedRef<string>
  getEntityNames: (ids: unknown[], entityType: 'blockInstance' | 'partInstance') => string[]
  partsSummary: import('vue').ComputedRef<string>
  isRelationshipCollectionField: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => boolean
  partsCollectionRef: import('vue').Ref<PartsCollectionRefValue>
  expandedPanels: import('vue').Ref<string[]>
  partsBulkEditMode: import('vue').ComputedRef<boolean>
  togglePartsBulkEditMode: () => void
  relationshipsSummary: import('vue').ComputedRef<string>
  hasAnySubPanelFields: import('vue').ComputedRef<boolean>
}

export function useEntityCardSubPanels(props: UseEntityCardSubPanelsOptions): UseEntityCardSubPanelsReturn {
  const entityKey = computed(() => props.entityKey)
  const entity = computed(() => props.entity)
  const form = computed(() => props.form)
  const subPanelFields = computed(() => props.subPanelFields)
  const fieldMetadata = computed(() => props.fieldMetadata)
  const { entities: blockInstances } = useEntityCrud('blockInstance')
  const { entities: partInstances } = useEntityCrud('partInstance')
  const { entities: partShapes } = useEntityCrud('partShape')
  const { entities: blockShapes } = useEntityCrud('blockShape')

  const blockShapeName = computed((): string => {
    if (entityKey.value !== 'blockInstance') return ''
    return blockShapeDisplayNameForBlockInstance(entity.value as GlobalEntity<'blockInstance'>, blockShapes.value)
  })

  const getEntityNames = (ids: unknown[], entityType: 'blockInstance' | 'partInstance'): string[] =>
    getEntityNamesForCard(ids, entityType, blockInstances.value, partInstances.value)

  const partsSummary = computed((): string =>
    buildPartsSummaryForSubPanel(entityKey.value, form.value.values as Record<string, unknown>, {
      namesForPartInstanceIds: (ids) => getEntityNamesForCard(ids, 'partInstance', blockInstances.value, partInstances.value),
      namesForPartShapeIds: (ids) => getPartShapeNamesForCard(ids, partShapes.value),
    })
  )

  const isRelationshipCollectionField = (fieldKey: GlobalFieldKey<GlobalEntityKey>): boolean =>
    isEntityCardRelationshipCollectionField(entityKey.value, fieldKey, fieldMetadata.value)

  const partsCollectionRef = ref<PartsCollectionRefValue>(null)
  const expandedPanels = ref<string[]>([])

  const partsBulkEditMode = computed(() =>
    readBulkEditModeFromPartsCollection(firstPartsCollectionInstance(partsCollectionRef.value))
  )

  const togglePartsBulkEditMode = (): void =>
    togglePartsBulkEditModeForCard(partsCollectionRef, expandedPanels, nextTick)

  watch(partsBulkEditMode, (isEnabled) => ensurePartsPanelExpandedWhenBulkEnabled(isEnabled, expandedPanels))

  const relationshipsSummary = computed((): string =>
    formatTruncatedList(
      buildRelationshipTypesForSubPanel(
        entityKey.value,
        form.value.values as Record<string, unknown>,
        blockShapeName.value
      )
    )
  )

  const hasAnySubPanelFields = computed(() =>
    SUB_PANEL_KEYS.some((key) => subPanelFields.value[key].length > 0)
  )

  return {
    blockShapeName,
    getEntityNames,
    partsSummary,
    isRelationshipCollectionField,
    partsCollectionRef,
    expandedPanels,
    partsBulkEditMode,
    togglePartsBulkEditMode,
    relationshipsSummary,
    hasAnySubPanelFields,
  }
}
