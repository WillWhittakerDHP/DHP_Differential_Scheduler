/**
 * WHY: usePropertyDetailsLogic Composable

WHY: Moves property type block logic...
 */
import { computed, ref, type Ref } from 'vue'
import type { PlaceDetails } from '@/services/mapsApiService'
import { fetchPropertyEnrichment } from '@/services/propertyEnrichmentApiService'
import { createLogger } from '@/utils/logger'
import type {
  UsePropertyDetailsLogicParams,
  UsePropertyDetailsLogicReturn,
} from '@/types/booking/propertyDetailsLogic'
import {
  buildPropertyDetailsStepData,
  propertyDetailsFormValuesFromRefs,
} from '@/utils/booking/propertyDetailsStepSnapshot'
import { placeAddressPatchFromComponents } from '@/utils/booking/propertyDetailsFromPlaceDetails'
import { applyPropertyEnrichmentToFormFields } from '@/utils/booking/propertyEnrichmentApply'
import { applyFirstSuggestedBlockFromLists } from '@/utils/booking/suggestedBlockWizardApply'
import { buildPropertyEnrichmentWritersFromFormData } from '@/utils/booking/propertyFormEnrichmentWriters'
import { buildMlsSyncDeps, runPropertyMlsEnrichmentFlow } from '@/utils/booking/propertyMlsSync'
import {
  mapPropertyTypeBlockToListItem,
  type PropertyTypeBlockListContext,
} from '@/utils/booking/propertyTypeBlockListItem'
import type { PropertyEnrichmentResponse } from '@shared/types/propertyEnrichmentTypes'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { useGlobal } from '@/composables/useGlobal'
import { useComponentEntity } from '@/composables/useComponentEntity'
import type { PropertyEnrichmentFormWriters } from '@/utils/booking/propertyEnrichmentApply'

const logger = createLogger('usePropertyDetailsLogic')

function createRequiresUnitNumberComputed(wizard: UsePropertyDetailsLogicParams['wizard']) {
  return computed(() =>
    wizard.selectedPropertyTypeBlocks.value.some((selected) => selected.requiresUnitNumber === true)
  )
}

function createIsMultiFamilyComputed(wizard: UsePropertyDetailsLogicParams['wizard']) {
  return computed(() =>
    wizard.selectedPropertyTypeBlocks.value.some((selected) => selected.isMultiFamily === true)
  )
}

function createPropertyBlocksComputed(
  wizard: UsePropertyDetailsLogicParams['wizard'],
  listCtx: PropertyTypeBlockListContext
) {
  return computed(() =>
    wizard.availablePropertyTypeBlocks.value.map((adjustment) =>
      mapPropertyTypeBlockToListItem(adjustment, listCtx)
    )
  )
}

function createStepDataComputed(formData: UsePropertyDetailsLogicParams['formData']) {
  return computed(() => buildPropertyDetailsStepData(propertyDetailsFormValuesFromRefs(formData)))
}

function applyEnrichmentAndSuggestedBlocks(
  enrichment: PropertyEnrichmentResponse,
  writers: PropertyEnrichmentFormWriters,
  wizard: UsePropertyDetailsLogicParams['wizard']
): void {
  applyPropertyEnrichmentToFormFields(enrichment, writers)
  const suggestedIds = enrichment.suggestedBlockInstanceIds ?? []
  if (suggestedIds.length === 0) {
    return
  }
  wizard.batchUpdate(() => {
    applyFirstSuggestedBlockFromLists(
      suggestedIds,
      wizard.availablePropertyTypeBlocks.value,
      wizard.availableLineItemBlocks.value,
      (b) => {
        wizard.togglePropertyTypeBlock(b)
      },
      (b) => {
        wizard.toggleLineItemBlock(b)
      }
    )
  })
}

function createSyncMlsData(
  formData: UsePropertyDetailsLogicParams['formData'],
  wizard: UsePropertyDetailsLogicParams['wizard'],
  writers: PropertyEnrichmentFormWriters,
  isEnrichmentLoading: Ref<boolean>
): () => Promise<void> {
  return async () => {
    await runPropertyMlsEnrichmentFlow(
      buildMlsSyncDeps({
        formData,
        isEnrichmentLoading,
        fetchEnrichment: fetchPropertyEnrichment,
        onEnrichmentLoaded: (e) => applyEnrichmentAndSuggestedBlocks(e, writers, wizard),
      }),
      logger
    )
  }
}

function createPlaceHandlers(
  formData: UsePropertyDetailsLogicParams['formData'],
  isAddressExpanded: UsePropertyDetailsLogicParams['isAddressExpanded'],
  syncMLSData: () => Promise<void>
) {
  const handlePlaceSelected = (details: PlaceDetails): void => {
    const { addressComponents, coordinates, placeId } = details
    const patch = placeAddressPatchFromComponents(addressComponents, placeId, coordinates, (fieldName) => {
      logger.debug('Address component missing', { fieldName })
    })
    formData.address.value = patch.address
    formData.city.value = patch.city
    formData.state.value = patch.state
    formData.zipCode.value = patch.zipCode
    formData.candidatePlaceId.value = patch.candidatePlaceId
    formData.candidateCoordinates.value = patch.candidateCoordinates
    isAddressExpanded.value = true
    void syncMLSData().catch((err) => {
      logger.warn('MLS enrichment failed', { err })
    })
  }

  const handleAutocompleteError = (error: Error): void => {
    logger.warn('Autocomplete error, showing manual fields', { error })
    isAddressExpanded.value = true
  }

  const changeAddress = (): void => {
    isAddressExpanded.value = false
  }

  return { handlePlaceSelected, handleAutocompleteError, changeAddress }
}

export function usePropertyDetailsLogic(params: UsePropertyDetailsLogicParams): UsePropertyDetailsLogicReturn {
  const { wizard, formData, isAddressExpanded } = params
  const { getGlobalEntityById, getGlobalData } = useGlobal()
  const componentEntity = useComponentEntity<'blockInstance'>('blockInstance')

  const listCtx: PropertyTypeBlockListContext = {
    getGlobalData,
    getGlobalEntityById: (entityKey, id) => getGlobalEntityById(entityKey, id) ?? null,
    getInstanceComponentRelationships: (globalId: GlobalEntityId) =>
      componentEntity.data.getComponents(globalId),
  }

  const writers = buildPropertyEnrichmentWritersFromFormData(formData)
  const isEnrichmentLoading = ref(false)
  const syncMLSData = createSyncMlsData(formData, wizard, writers, isEnrichmentLoading)
  const { handlePlaceSelected, handleAutocompleteError, changeAddress } = createPlaceHandlers(
    formData,
    isAddressExpanded,
    syncMLSData
  )

  return {
    requiresUnitNumber: createRequiresUnitNumberComputed(wizard),
    isMultiFamily: createIsMultiFamilyComputed(wizard),
    propertyTypeBlocksWithComponents: createPropertyBlocksComputed(wizard, listCtx),
    stepData: createStepDataComputed(formData),
    syncMLSData,
    isEnrichmentLoading,
    handlePlaceSelected,
    handleAutocompleteError,
    changeAddress,
  }
}
