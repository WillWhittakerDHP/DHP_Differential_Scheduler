import type { BookingBlockInstance } from '@/types/transformers/bookingData'

export interface WizardStateData {
  userTypeBlock: BookingBlockInstance | null
  services: BookingBlockInstance[]
  propertyTypeBlocks: BookingBlockInstance[]
  optionTypeBlocks: BookingBlockInstance[]
  lineItemBlocks: BookingBlockInstance[]

  propertyDetails: {
    address: string
    unit: string
    city: string
    state: string
    zipCode: string
    candidatePlaceId?: string
    candidateCoordinates?: { lat: number; lng: number }
    propertySize: number | null
    numberOfUnits: number | null
    mlsNumber: string
    squareFootage: number | null
    bedrooms: number | null
    bathrooms: number | null
    foundationAccess: 'basement' | 'crawlspace' | 'slab' | null
    additionalUnits: number | null
  }

  contacts: {
    buyer: { firstName: string; lastName: string; email: string }
    agent: { firstName: string; lastName: string; email: string }
    additionalContacts: Array<{
      firstName: string
      lastName: string
      email: string
      role: 'anotherBuyer' | 'owner'
    }>
  }

  availability: {
    candidateDate: { start: string | null; end: string | null }
    candidateTimeSlots: Array<{ time: string; duration: number }> | null
  }

  isQuoteMode: boolean
}
