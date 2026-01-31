import { ref, computed } from 'vue'
import { categorizeFieldsByLayout as categorizeFieldsByLayoutPure } from '@/utils/forms/layoutFieldCategorization'
import type { UseFormFieldsOptions, UseFormFieldsReturn } from './types'
import { useFormFieldsContext } from './useFormFieldsContext'
import { useFormFieldsStandardLayout } from './useFormFieldsStandardLayout'
import { useAdmin } from '@/composables/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

/**
 * Form Fields Composable (facade)
 *
 * LEARNING: Provides unified form field management logic for ALL entity types
 * WHY: Encapsulates field context creation, categorization, and layout logic
 * PATTERN: Single unified layout mechanism - no entity-type-specific code paths
 */
export function useFormFields(options: UseFormFieldsOptions): UseFormFieldsReturn {
  const {
    entityKey,
    entityId,
    form: providedForm,
    fieldKeys,
    fieldMetadata,
    inlineFieldsConfig = ref<GlobalFieldKey<GlobalEntityKey>[]>([]),
    stackedFieldsConfig = ref<GlobalFieldKey<GlobalEntityKey>[]>([]),
    adminConfig: providedAdminConfig,
  } = options

  const context = useFormFieldsContext({
    entityKey,
    entityId,
    fieldKeys,
    fieldMetadata,
    form: providedForm,
    adminConfig: providedAdminConfig,
  })

  const adminComp = useAdmin()

  const getReadyFields = (
    fields: GlobalFieldKey<GlobalEntityKey>[]
  ): GlobalFieldKey<GlobalEntityKey>[] => {
    return fields.filter((fieldKey) => {
      const fieldKeyStr = String(fieldKey)
      // LEARNING: Field must have both context AND metadata to be ready
      // WHY: FieldRenderer needs metadata to determine input type (renderAs, inputConfig, etc.)
      // PATTERN: Check both context existence and metadata existence
      const hasContext = !!context.getFieldContext(fieldKey as GlobalFieldKey<typeof entityKey>)
      const hasMetadata = fieldMetadata?.value && fieldKeyStr in fieldMetadata.value
      return hasContext && hasMetadata
    })
  }

  const categorizeFieldsByLayout = (fields: GlobalFieldKey<GlobalEntityKey>[]) => {
    return categorizeFieldsByLayoutPure(
      fields,
      inlineFieldsConfig.value || [],
      stackedFieldsConfig.value || []
    )
  }

  // LEARNING: Unified layout for ALL entity types
  // WHY: No special cases - blockInstance uses same layout mechanism as all other entities
  // PATTERN: Single code path for all entities
  const standardLayout = useFormFieldsStandardLayout({
    fieldKeys,
    inlineFieldsConfig,
    stackedFieldsConfig,
    getReadyFields,
  })

  // LEARNING: BlockShape properties helper (for blockInstance)
  // WHY: Still needed for conditional field visibility logic (e.g., baseSqFt when canHaveParts)
  // PATTERN: Pure function that checks blockShape properties
  const getBlockShapeProperties = (): { composable: boolean; canHaveParts: boolean } => {
    if (entityKey !== 'blockInstance') {
      return { composable: false, canHaveParts: false }
    }

    const entityIdValue = context.currentEntityId.value
    const blockInstance = adminComp.getEntity('blockInstance', entityIdValue)
    if (!blockInstance) {
      return { composable: false, canHaveParts: false }
    }

    const blockShapeRef = blockInstance.blockShapeRef

    const blockShape = adminComp.getEntity('blockShape', blockShapeRef)
    if (!blockShape) {
      return { composable: false, canHaveParts: false }
    }

    return {
      composable: blockShape.composable === true,
      canHaveParts: blockShape.canHaveParts === true,
    }
  }

  // LEARNING: Should show part instances (for blockInstance)
  // WHY: Used to conditionally show PartsCollection
  // PATTERN: Computed property that checks blockShape canHaveParts property
  const shouldShowPartInstances = computed(() => {
    if (entityKey !== 'blockInstance') {
      return false
    }
    const props = getBlockShapeProperties()
    return props.canHaveParts
  })

  return {
    // Field context management
    fieldContextCache: context.fieldContextCache,
    isFormReady: context.isFormReady,
    fieldsNeedingContexts: context.fieldsNeedingContexts,
    getFieldContext: context.getFieldContext,

    // BlockShape properties (for blockInstance)
    getBlockShapeProperties,
    shouldShowPartInstances,

    // Field categorization
    categorizeFieldsByLayout,
    getReadyFields,

    // Unified field categorization (for ALL entity types)
    inlineFields: standardLayout.inlineFields,
    stackedFields: standardLayout.stackedFields,
    readyInlineFields: standardLayout.readyInlineFields,
    readyStackedFields: standardLayout.readyStackedFields,
  }
}


