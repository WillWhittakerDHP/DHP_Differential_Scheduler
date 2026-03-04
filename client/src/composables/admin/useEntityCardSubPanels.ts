/**
 */
import { computed, ref, watch, nextTick } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormContext } from 'vee-validate'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { SUB_PANEL_KEYS, type SubPanelRecord } from '@/constants/fieldMetadata'
import { getFieldComponent } from '@/utils/forms/fieldComponentDispatcher'
import type RelationshipCollection from '@/components/admin/generic/collections/RelationshipCollection.vue'

type RelationshipCollectionRef = InstanceType<typeof RelationshipCollection>

const MAX_DISPLAY_ITEMS = 2

function formatTruncatedList(items: string[], maxDisplay: number = MAX_DISPLAY_ITEMS): string {
  if (items.length === 0) return ''
  const displayItems = items.slice(0, maxDisplay)
  const remaining = items.length - maxDisplay
  if (remaining <= 0) return displayItems.join(', ')
  return `${displayItems.join(', ')} +${remaining} more`
}

export type SubPanelFields = SubPanelRecord<GlobalFieldKey<GlobalEntityKey>[]>

export interface UseEntityCardSubPanelsOptions {
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
  partsCollectionRef: import('vue').Ref<(RelationshipCollectionRef)[] | RelationshipCollectionRef | null>
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
  const { entities: blockShapes } = useEntityCrud('blockShape')

  const blockShapeName = computed((): string => {
    if (entityKey.value !== 'blockInstance') return ''
    const entityVal = entity.value
    const blockEntity = entityVal as GlobalEntity<'blockInstance'>
    const blockShape = blockShapes.value.find((bs) => bs.id === blockEntity.blockShapeRef)
    const name = blockShape?.name
    return name !== undefined && name !== null && name !== '' ? name : 'Block'
  })

  function getEntityNames(ids: unknown[], entityType: 'blockInstance' | 'partInstance'): string[] {
    if (!Array.isArray(ids)) return []
    const entities = entityType === 'blockInstance' ? blockInstances.value : partInstances.value
    return ids
      .map((id) => {
        const found = entities.find((e) => e.id === id)
        return found?.name ?? null
      })
      .filter((name): name is string => name !== null)
  }

  const partsSummary = computed((): string => {
    if (entityKey.value !== 'blockInstance') return ''
    const partAssignments = form.value.values.partAssignments
    if (!Array.isArray(partAssignments) || partAssignments.length === 0) return ''
    return formatTruncatedList(getEntityNames(partAssignments, 'partInstance'))
  })

  function isRelationshipCollectionField(fieldKey: GlobalFieldKey<GlobalEntityKey>): boolean {
    const meta = fieldMetadata.value
    if (!meta) return false
    const fieldMeta = meta[String(fieldKey)]
    if (!fieldMeta) return false
    const componentType = getFieldComponent(entityKey.value, fieldKey, fieldMeta)
    return componentType.type === 'relationshipCollection'
  }

  const partsCollectionRef = ref<(RelationshipCollectionRef)[] | RelationshipCollectionRef | null>(null)
  const expandedPanels = ref<string[]>([])

  const partsBulkEditMode = computed(() => {
    const refValue = partsCollectionRef.value
    const instance = Array.isArray(refValue) ? refValue[0] ?? null : refValue
    if (instance?.bulkEditMode && typeof instance.bulkEditMode === 'object' && 'value' in instance.bulkEditMode) {
      return (instance.bulkEditMode as { value: boolean }).value
    }
    return false
  })

  function togglePartsBulkEditMode(): void {
    const refValue = partsCollectionRef.value
    const instance = Array.isArray(refValue) ? refValue[0] ?? null : refValue
    type WithToggle = { toggleBulkEditMode?: () => void }
    const callToggle = (target: RelationshipCollectionRef | null): void => {
      const t = target as WithToggle | null
      if (t && typeof t.toggleBulkEditMode === 'function') {
        t.toggleBulkEditMode()
      }
    }
    if (!expandedPanels.value.includes('parts')) {
      expandedPanels.value.push('parts')
      nextTick(() => {
        const inst = Array.isArray(partsCollectionRef.value) ? partsCollectionRef.value[0] ?? null : partsCollectionRef.value
        callToggle(inst)
      })
    } else {
      callToggle(instance)
    }
  }

  watch(partsBulkEditMode, (isEnabled) => {
    if (isEnabled && !expandedPanels.value.includes('parts')) {
      expandedPanels.value.push('parts')
    }
  })

  const relationshipsSummary = computed((): string => {
    const formValues = form.value.values
    const relationshipTypes: string[] = []
    if (entityKey.value === 'blockInstance') {
      const cascades = Array.isArray(formValues.bookingCascades) ? formValues.bookingCascades : []
      const components = Array.isArray(formValues.instanceComponents) ? formValues.instanceComponents : []
      const dependentInstances = Array.isArray(formValues.dependentInstances) ? formValues.dependentInstances : []
      if (cascades.length > 0) relationshipTypes.push('Booking Cascades')
      if (components.length > 0) relationshipTypes.push(`${blockShapeName.value} Components`)
      if (dependentInstances.length > 0) relationshipTypes.push(`Dependent ${blockShapeName.value} Instances`)
    } else if (entityKey.value === 'blockShape') {
      const cascades = Array.isArray(formValues.validCascades) ? formValues.validCascades : []
      const parts = Array.isArray(formValues.validParts) ? formValues.validParts : []
      if (cascades.length > 0) relationshipTypes.push('Valid Cascades')
      if (parts.length > 0) relationshipTypes.push('Valid Parts')
    } else if (entityKey.value === 'partInstance') {
      const pricingCascades = Array.isArray(formValues.pricingCascades) ? formValues.pricingCascades : []
      if (pricingCascades.length > 0) relationshipTypes.push('Pricing Cascades')
    } else if (entityKey.value === 'partShape') {
      const validPricingCascades = Array.isArray(formValues.validPricingCascades) ? formValues.validPricingCascades : []
      if (validPricingCascades.length > 0) relationshipTypes.push('Valid Pricing Cascades')
    }
    return formatTruncatedList(relationshipTypes)
  })

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
