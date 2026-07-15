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
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'

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
  partsPanelTitle: import('vue').ComputedRef<string>
  partsBulkEditLabel: import('vue').ComputedRef<string>
  isRelationshipCollectionField: (fieldKey: GlobalFieldKey<GlobalEntityKey>) => boolean
  partsCollectionRef: import('vue').Ref<PartsCollectionRefValue>
  expandedPanels: import('vue').Ref<string[]>
  partsBulkEditMode: import('vue').ComputedRef<boolean>
  togglePartsBulkEditMode: () => void
  relationshipsSummary: import('vue').ComputedRef<string>
  eventsPanelTitle: import('vue').ComputedRef<string>
  showTimeBlockEventReadout: import('vue').ComputedRef<boolean>
  showEventsPanel: import('vue').ComputedRef<boolean>
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

  const blockShapeSemanticType = computed((): string | null => {
    if (entityKey.value !== 'blockInstance') return null
    const blockInstance = entity.value as GlobalEntity<'blockInstance'>
    const blockShape = blockShapes.value.find((shape) => shape.id === blockInstance.blockShapeRef)
    return blockShape?.semanticType ?? null
  })

  const getEntityNames = (ids: unknown[], entityType: 'blockInstance' | 'partInstance'): string[] =>
    getEntityNamesForCard(ids, entityType, blockInstances.value, partInstances.value)

  const partsSummary = computed((): string =>
    buildPartsSummaryForSubPanel(entityKey.value, form.value.values as Record<string, unknown>, {
      namesForPartInstanceIds: (ids) => getEntityNamesForCard(ids, 'partInstance', blockInstances.value, partInstances.value),
      namesForPartShapeIds: (ids) => getPartShapeNamesForCard(ids, partShapes.value),
    })
  )

  const partsPanelTitle = computed(() =>
    blockShapeSemanticType.value === BLOCK_SHAPE_TYPES.EVENT ? 'Included part types' : 'Parts'
  )

  const isRelationshipCollectionField = (fieldKey: GlobalFieldKey<GlobalEntityKey>): boolean =>
    isEntityCardRelationshipCollectionField(entityKey.value, fieldKey, fieldMetadata.value)

  const partsCollectionRef = ref<PartsCollectionRefValue>(null)
  const expandedPanels = ref<string[]>([])

  const partsBulkEditMode = computed(() =>
    readBulkEditModeFromPartsCollection(firstPartsCollectionInstance(partsCollectionRef.value))
  )

  const partsBulkEditLabel = computed(() =>
    partsBulkEditMode.value ? 'Exit Bulk Edit' : 'Bulk Edit'
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

  const eventsPanelTitle = computed(() =>
    blockShapeName.value ? `${blockShapeName.value} Events` : 'Events'
  )

  const showTimeBlockEventReadout = computed(() =>
    entityKey.value === 'blockInstance' &&
    blockShapeSemanticType.value === BLOCK_SHAPE_TYPES.TIME
  )

  const showEventsPanel = computed(() =>
    subPanelFields.value.events.length > 0 || showTimeBlockEventReadout.value
  )

  const hasAnySubPanelFields = computed(() =>
    SUB_PANEL_KEYS.some((key) =>
      key === 'events' ? showEventsPanel.value : subPanelFields.value[key].length > 0
    )
  )

  return {
    blockShapeName,
    getEntityNames,
    partsSummary,
    partsPanelTitle,
    partsBulkEditLabel,
    isRelationshipCollectionField,
    partsCollectionRef,
    expandedPanels,
    partsBulkEditMode,
    togglePartsBulkEditMode,
    relationshipsSummary,
    eventsPanelTitle,
    showTimeBlockEventReadout,
    showEventsPanel,
    hasAnySubPanelFields,
  }
}
