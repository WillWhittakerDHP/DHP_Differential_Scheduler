/**
 * WHY: Component-logic audit - move watch(shouldShowError) out of FieldRenderer.
 */
import { watch, type ComputedRef } from 'vue'
import type { FieldComponent } from '@/types/forms/fieldComponent'
import type { Component } from 'vue'
import type { AppLogger } from '@/utils/logger'

export interface UseFieldRendererErrorWatchParams {
  shouldShowError: ComputedRef<boolean>
  effectiveFieldContext: ComputedRef<{ fieldKey: unknown; entityKey: unknown; entityId?: string } | undefined>
  fieldComponent: { componentType: ComputedRef<FieldComponent>; fieldMetadataEntry: ComputedRef<unknown> }
  fieldKey: ComputedRef<unknown>
  entityKey: ComputedRef<unknown>
  fieldContext: ComputedRef<{ entityKey?: unknown; entityId?: string; fieldKey?: unknown } | undefined>
  componentMap: Record<string, Component | null>
  logger: AppLogger
}

export function useFieldRendererErrorWatch(params: UseFieldRendererErrorWatchParams): void {
  const {
    shouldShowError,
    effectiveFieldContext,
    fieldComponent,
    fieldKey,
    entityKey,
    fieldContext,
    componentMap,
    logger,
  } = params

  watch(
    shouldShowError,
    (showError) => {
      if (!showError || !effectiveFieldContext.value) return
      const componentType = fieldComponent.componentType.value
      const componentMapEntry = componentMap[componentType?.type]
      const hasComponent = componentMapEntry !== null && componentMapEntry !== undefined
      const metadataEntry = fieldComponent.fieldMetadataEntry.value
      const reason = 'reason' in componentType ? componentType.reason : 'unknown'
      logger.error('Unknown input type detected', {
        componentType: componentType?.type,
        reason,
        fullComponentType: componentType,
        fieldKey: fieldKey.value,
        entityKey: entityKey.value,
        entityId: fieldContext.value?.entityId,
        fieldMetadataEntry: metadataEntry,
        renderAs: (metadataEntry as { renderAs?: string })?.renderAs,
        dataType: (metadataEntry as { dataType?: string })?.dataType,
        inputConfig: (metadataEntry as { inputConfig?: unknown })?.inputConfig,
        fieldContext: {
          entityKey: fieldContext.value?.entityKey,
          entityId: fieldContext.value?.entityId,
          fieldKey: fieldContext.value?.fieldKey,
        },
        componentMapHasEntry: hasComponent,
        componentMapEntry,
        componentMapKeys: Object.keys(componentMap),
        suggestedFix:
          reason === 'notConfigured'
            ? 'Add field metadata at /admin-input-metadata or /admin-relationship-metadata'
            : reason === 'invalidRenderAs'
              ? `Check renderAs value in metadata. Expected: text, number, statusButton, iconSelect, select, multiselect, reference. Found: ${(metadataEntry as { renderAs?: string })?.renderAs ?? 'undefined'}`
              : 'Unknown error - check field metadata configuration',
      })
    },
    { immediate: true }
  )
}
