import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'

export type AdminObject<GE extends GlobalEntityKey> = GlobalEntity<GE> & {
  validCascades?: GlobalEntityId[]
  validParts?: GlobalEntityId[]
  validAnnotations?: GlobalEntityId[]
  validEvents?: GlobalEntityId[]
  bookingCascades?: GlobalEntityId[]
  pricingCascades?: GlobalEntityId[]
  validPricingCascades?: GlobalEntityId[]
  partAssignments?: GlobalEntityId[]
  annotationAssignments?: GlobalEntityId[]
  eventAssignments?: GlobalEntityId[]
  instanceComponents?: GlobalEntityId[]
}

export type AdminObjectMap = {
  [GE in GlobalEntityKey]: AdminObject<GE>[]
}
