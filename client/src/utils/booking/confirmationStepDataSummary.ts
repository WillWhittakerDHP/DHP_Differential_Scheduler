import type { SummaryData } from '@/types/wizardStepData'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'
import type { MinimizerSlot } from '@/types/minimizerScheduling'
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import type { PropertyDetailsStepData, WizardSelectionState } from './confirmationStepDataShared'

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Invalid time range'
  const to12h = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${to12h(start)} - ${to12h(end)}`
}

export function buildConfirmationSummaryData(
  wizard: WizardSelectionState,
  propertyDetailsStepData?: PropertyDetailsStepData | null,
  availabilityStepData?: AvailabilityStepData | null
): SummaryData {
  const serviceNames = wizard.selectedServices.map((s) => s.name)
  const serviceType =
    serviceNames.length > 0 ? (serviceNames.length === 1 ? serviceNames[0] : `${serviceNames.length} Services`) : 'No service selected'

  const propertyNames = wizard.selectedPropertyTypeBlocks.map((d) => d.name)
  const propertyType =
    propertyNames.length > 0 ? (propertyNames.length === 1 ? propertyNames[0] : propertyNames.join(', ')) : 'No property type selected'

  const addressParts = propertyDetailsStepData
    ? [
        propertyDetailsStepData.address,
        propertyDetailsStepData.unit ? `#${propertyDetailsStepData.unit}` : null,
        propertyDetailsStepData.city,
        propertyDetailsStepData.state,
        propertyDetailsStepData.zipCode
      ].filter((part): part is string => typeof part === 'string' && part !== '')
    : []
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'No address provided'

  const squareFootage = propertyDetailsStepData?.squareFootage
    ? `${propertyDetailsStepData.squareFootage}sqft`
    : propertyDetailsStepData?.propertySize
      ? `${propertyDetailsStepData.propertySize}sqft`
      : APPOINTMENTS_TABLE_UI.NOT_SPECIFIED

  const appointmentDate = availabilityStepData?.candidateDate?.start
    ? new Date(availabilityStepData.candidateDate.start).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : undefined

  const appointmentTimes = availabilityStepData?.candidateTimeSlots?.length
    ? availabilityStepData.candidateTimeSlots
        .map((slot) => formatTimeRange(slot.startTime, slot.endTime))
        .join(' | ')
    : undefined

  const minimizerScheduling = availabilityStepData?.minimizerScheduling
  const selectedMinimizerIndex = minimizerScheduling?.selectedSlotIndex
  const minimizerSlots: MinimizerSlot[] =
    minimizerScheduling != null && minimizerScheduling.availableSlots != null
      ? minimizerScheduling.availableSlots
      : []
  const minimizerSlot =
    typeof selectedMinimizerIndex === 'number' && selectedMinimizerIndex >= 0
      ? minimizerSlots[selectedMinimizerIndex] ?? null
      : null
  const minimizerCompletion = minimizerSlot
    ? formatDateTime(minimizerSlot.startTime)
    : undefined

  const minimizerPartShapeName = availabilityStepData?.minimizerScheduling?.partShapeName

  const minimizerDeadline = availabilityStepData?.minimizerScheduling?.outerBoundary
    ? formatDateTime(availabilityStepData.minimizerScheduling.outerBoundary)
    : undefined

  return {
    serviceType,
    propertyType,
    address,
    squareFootage,
    appointmentDate,
    appointmentTimes,
    minimizerPartShapeName,
    minimizerCompletion,
    minimizerDeadline,
  }
}
