import type { Ref, ComputedRef } from 'vue'
import type { BookingBlockInstance, BookingPartInstance } from '@/types/transformers/bookingData'
import type { ComponentItem as SelectionCardComponentItem, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'
import type { WizardStateData } from '@/types/booking/wizardStateData'
import type { PropertyDetailsData, PropertyFormData } from '@/types/propertyForm'
import type { PlaceDetails } from '@/services/mapsApiService'

export interface ComponentItem extends SelectionCardComponentItem {
  description?: string
}

export interface SelectionCardItemWithComponents extends SelectionCardItem {
  blockShapeName?: string
  bookingMode?: string
  partInstances?: BookingPartInstance[]
}

export interface PropertyFormStateCore {
  formData: PropertyFormData
  isAddressExpanded: Ref<boolean>
}

export interface UsePropertyDetailsLogicParams extends PropertyFormStateCore {
  wizard: {
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    availablePropertyTypeBlocks: Ref<BookingBlockInstance[]>
    availableLineItemBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<{ id: string } | null>
    togglePropertyTypeBlock: (block: BookingBlockInstance) => void
    toggleLineItemBlock: (block: BookingBlockInstance) => void
    batchUpdate: (fn: () => void) => void
  }
  loadedWizardState: Ref<WizardStateData | null> | null
}

export interface UsePropertyDetailsLogicReturn {
  requiresUnitNumber: ComputedRef<boolean>
  isMultiFamily: ComputedRef<boolean>
  propertyTypeBlocksWithComponents: ComputedRef<SelectionCardItemWithComponents[]>
  stepData: ComputedRef<PropertyDetailsData>
  syncMLSData: () => Promise<void>
  isEnrichmentLoading: Ref<boolean>
  handlePlaceSelected: (details: PlaceDetails) => void
  handleAutocompleteError: (error: Error) => void
  changeAddress: () => void
}
