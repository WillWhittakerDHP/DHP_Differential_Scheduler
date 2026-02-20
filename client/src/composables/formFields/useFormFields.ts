import { ref, computed } from 'vue'
import { categorizeFieldsByLayout as categorizeFieldsByLayoutPure } from '@/utils/forms/layoutFieldCategorization'
import type { UseFormFieldsOptions, UseFormFieldsReturn } from './types'
import { useFormFieldsContext } from './useFormFieldsContext'
import { useFormFieldsStandardLayout } from './useFormFieldsStandardLayout'
import { useAdmin } from '@/composables/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

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
      // PATTERN: Check both context existence and metadata existence
      const hasContext = !!context.getFieldContext(fieldKey as GlobalFieldKey<typeof entityKey>)
      const hasMetadata = fieldMetadata?.value && fieldKeyStr in fieldMetadata.value
      return hasContext && hasMetadata
    })
  }

  const categorizeFieldsByLayout = (fields: GlobalFieldKey<GlobalEntityKey>[]) => {
    return categorizeFieldsByLayoutPure(
      fields.map(String),
      (inlineFieldsConfig.value || []).map(String),
      (stackedFieldsConfig.value || []).map(String)
    )
  }

  // WHY: No special cases - blockInstance uses same layout mechanism as all other entities
  // PATTERN: Single code path for all entities
  const standardLayout = useFormFieldsStandardLayout({
    fieldKeys,
    inlineFieldsConfig,
    stackedFieldsConfig,
    getReadyFields,
  })

  // PATTERN: Pure function that checks blockShape properties
  const getBlockShapeProperties = (): { composable: boolean; canHaveParts: boolean } => {
    if (entityKey !== 'blockInstance') {
      return { composable: false, canHaveParts: false }
    }

    const entityIdValue = context.currentEntityId.value
    const blockInstance = adminComp.getEntity('blockInstance', toGlobalEntityId(entityIdValue))
    if (!blockInstance) {
      return { composable: false, canHaveParts: false }
    }

    const blockShapeRef = blockInstance.blockShapeRef

    const blockShape = adminComp.getEntity('blockShape', toGlobalEntityId(blockShapeRef))
    if (!blockShape) {
      return { composable: false, canHaveParts: false }
    }

    return {
      composable: blockShape.composable === true,
      canHaveParts: blockShape.canHaveParts === true,
    }
  }

  // PATTERN: Computed property that checks blockShape canHaveParts property
  const shouldShowPartInstances = computed(() => {
    if (entityKey !== 'blockInstance') {
      return false
    }
    const props = getBlockShapeProperties()
    return props.canHaveParts
  })

  return {
    fieldContextCache: context.fieldContextCache,
    isFormReady: context.isFormReady,
    fieldsNeedingContexts: context.fieldsNeedingContexts,
    getFieldContext: context.getFieldContext,

    getBlockShapeProperties,
    shouldShowPartInstances,

    categorizeFieldsByLayout,
    getReadyFields,

    inlineFields: standardLayout.inlineFields,
    stackedFields: standardLayout.stackedFields,
    readyInlineFields: standardLayout.readyInlineFields,
    readyStackedFields: standardLayout.readyStackedFields,
  }
}


