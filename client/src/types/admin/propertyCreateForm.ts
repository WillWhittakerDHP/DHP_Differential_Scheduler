import type { ComputedRef } from 'vue'
import type { PropertyRequest } from '@/types/property'

export interface UsePropertyCreateFormParams {
  newProperty: { value: PropertyRequest | Partial<PropertyRequest> | undefined }
}

export interface UsePropertyCreateFormReturn {
  address: ComputedRef<string>
  unit: ComputedRef<string>
  city: ComputedRef<string>
  state: ComputedRef<string>
  zipCode: ComputedRef<string>
  squareFootage: ComputedRef<number | undefined>
  mlsNumber: ComputedRef<string>
  bedrooms: ComputedRef<number | undefined>
  bathrooms: ComputedRef<number | undefined>
  foundationAccess: ComputedRef<string | undefined>
  additionalUnits: ComputedRef<number | undefined>
  setAddress: (v: string) => void
  setUnit: (v: string) => void
  setCity: (v: string) => void
  setState: (v: string) => void
  setZipCode: (v: string) => void
  setSquareFootage: (v: number | string | null) => void
  setMlsNumber: (v: string) => void
  setBedrooms: (v: number | string | null) => void
  setBathrooms: (v: number | string | null) => void
  setFoundationAccess: (v: string | null) => void
  setAdditionalUnits: (v: number | string | null) => void
}
