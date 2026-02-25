import type { AvailabilityStepParamsBase } from '@/types/availabilityStepParams'
import type { UseStepValidationReturn } from '@/composables/booking/useStepValidation'

/** Same shape as shared base (P2 type-similarity). */
export type UseAvailabilityValidationParams = AvailabilityStepParamsBase

export type UseAvailabilityValidationReturn = UseStepValidationReturn
