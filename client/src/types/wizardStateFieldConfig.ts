import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

type RefLike<T> = { readonly value: T }

export type WizardInstance = {
  selectedUserTypeBlock: RefLike<BookingBlockInstance | null>
  selectedServiceTypeBlocks: RefLike<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: RefLike<BookingBlockInstance[]>
  selectedOptionTypeBlocks: RefLike<BookingBlockInstance[]>
  selectedLineItemBlocks: RefLike<BookingBlockInstance[]>
  selectUserTypeBlock: (block: BookingBlockInstance | null) => void
  toggleServiceTypeBlock: (block: BookingBlockInstance) => void
  togglePropertyTypeBlock: (block: BookingBlockInstance) => void
  toggleOptionTypeBlock: (block: BookingBlockInstance) => void
  toggleLineItemBlock: (block: BookingBlockInstance) => void
}

export type WizardStateField = 'userTypeBlock' | 'services' | 'propertyTypeBlocks' | 'optionTypeBlocks' | 'lineItemBlocks'

export interface WizardFieldConfig {
  isArray: boolean
  singleSelectUI: boolean
  getSelectedArray: (wizard: WizardInstance) => BookingBlockInstance[]
  getSelectedValue: (wizard: WizardInstance) => BookingBlockInstance | null
  toggleInArray: (wizard: WizardInstance, block: BookingBlockInstance) => void
  setSelectedValue: (wizard: WizardInstance, block: BookingBlockInstance | null) => void
  watchSource: (wizard: WizardInstance) => RefLike<BookingBlockInstance[] | BookingBlockInstance | null>
}
