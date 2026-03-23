import type { Ref } from 'vue'
import type { PropertyRequest } from '@/types/property'
import type { UsePropertyCreateFormReturn } from '@/types/admin/propertyCreateForm'

function withWritableProperty(
  newProperty: Ref<PropertyRequest | Partial<PropertyRequest>>,
  apply: (p: PropertyRequest & Partial<PropertyRequest>) => void
): void {
  const current = newProperty.value
  if (current) {
    apply(current as PropertyRequest & Partial<PropertyRequest>)
  }
}

const FOUNDATION_ACCESS_VALUES = new Set(['basement', 'crawlspace', 'slab'])

export function createPropertyCreateFormSetters(
  newProperty: Ref<PropertyRequest | Partial<PropertyRequest>>
): Pick<
  UsePropertyCreateFormReturn,
  | 'setAddress'
  | 'setUnit'
  | 'setCity'
  | 'setState'
  | 'setZipCode'
  | 'setSquareFootage'
  | 'setMlsNumber'
  | 'setBedrooms'
  | 'setBathrooms'
  | 'setFoundationAccess'
  | 'setAdditionalUnits'
> {
  return {
    setAddress(v: string): void {
      withWritableProperty(newProperty, (p) => {
        p.address = v
      })
    },
    setUnit(v: string): void {
      withWritableProperty(newProperty, (p) => {
        p.unit = v
      })
    },
    setCity(v: string): void {
      withWritableProperty(newProperty, (p) => {
        p.city = v
      })
    },
    setState(v: string): void {
      withWritableProperty(newProperty, (p) => {
        p.state = v
      })
    },
    setZipCode(v: string): void {
      withWritableProperty(newProperty, (p) => {
        p.zipCode = v
      })
    },
    setSquareFootage(v: number | string | null): void {
      withWritableProperty(newProperty, (p) => {
        p.squareFootage = v != null ? Number(v) : undefined
      })
    },
    setMlsNumber(v: string): void {
      withWritableProperty(newProperty, (p) => {
        p.mlsNumber = v
      })
    },
    setBedrooms(v: number | string | null): void {
      withWritableProperty(newProperty, (p) => {
        p.bedrooms = v != null ? Number(v) : undefined
      })
    },
    setBathrooms(v: number | string | null): void {
      withWritableProperty(newProperty, (p) => {
        p.bathrooms = v != null ? Number(v) : undefined
      })
    },
    setFoundationAccess(v: string | null): void {
      withWritableProperty(newProperty, (p) => {
        p.foundationAccess =
          v != null && FOUNDATION_ACCESS_VALUES.has(v) ? (v as PropertyRequest['foundationAccess']) : undefined
      })
    },
    setAdditionalUnits(v: number | string | null): void {
      withWritableProperty(newProperty, (p) => {
        p.additionalUnits = v != null ? Number(v) : undefined
      })
    },
  }
}
