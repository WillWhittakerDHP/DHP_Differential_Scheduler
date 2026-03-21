
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, computed } from 'vue'
import { useMoveablePartsScheduling } from '../useMoveablePartsScheduling'
import type { AppointmentShape, AppointmentSlot } from '@/types/appointment'

vi.mock('@/services/calendarApiService', () => ({
  fetchComputedAvailabilityData: async () => ({
    slotsByDay: {},
    calendarEvents: [],
    constraints: [],
    minuteIncrement: 15,
    timezone: undefined,
    durationRounding: undefined,
    outOfOfficeEvents: [],
    _meta: { dateRange: { start: '', end: '' }, generatedAt: '', cacheStatus: { events: 'miss' as const } }
  })
}))

vi.mock('@/configs/availabilitySettings', () => ({
  getAvailabilitySettings: async () => ({
    businessHours: {
      0: { start: '09:00', end: '17:00' },
      1: { start: '09:00', end: '19:00' },
      2: { start: '09:00', end: '19:00' },
      3: { start: '09:00', end: '19:00' },
      4: { start: '09:00', end: '19:00' },
      5: { start: '09:00', end: '19:00' },
      6: { start: '09:00', end: '17:00' }
    },
    minuteIncrement: 15,
    leadTime: 60
  })
}))

function createAppointmentShape(options: {
  totalMoveableDuration?: number
  totalOnSiteDuration?: number
  totalDuration?: number
} = {}): AppointmentShape {
  return {
    finalizedParts: [],
    slotShape: {
      totalDuration: options.totalDuration ?? 120,
      onSite: options.totalOnSiteDuration ?? 60,
      clientPresent: 60,
      moveable: options.totalMoveableDuration ?? 0,
      differentialOffset: 0
    }
  }
}

function createAppointmentSlot(options: {
  totalOnSiteEndTime?: string
  totalTimeEndTime?: string
} = {}): AppointmentSlot {
  const baseTime = '2026-01-15T10:00:00Z'
  const onSiteEnd = options.totalOnSiteEndTime || '2026-01-15T11:00:00Z'
  const totalEnd = options.totalTimeEndTime || '2026-01-15T12:00:00Z'
  
  const shape: AppointmentShape = {
    finalizedParts: [],
    slotShape: {
      totalDuration: 120,
      onSite: 60,
      clientPresent: 60,
      moveable: 0,
      differentialOffset: 0
    }
  }
  
  return {
    buttonIndex: 0,
    isAvailable: true,
    shape,
    startTime: baseTime,
    onSiteTimeRange: {
      startTime: baseTime,
      endTime: onSiteEnd,
      duration: 60
    },
    clientPresentTimeRange: {
      startTime: baseTime,
      endTime: onSiteEnd,
      duration: 60
    },
    moveableTimeRange: null,
    totalTimeRange: {
      startTime: baseTime,
      endTime: totalEnd,
      duration: 120
    }
  }
}

const propertyDetailsStepData = ref<{ candidatePlaceId?: string } | null>(null)

describe('useMoveablePartsScheduling', () => {
  let appointmentShape: ReturnType<typeof computed<AppointmentShape | null>>
  let selectedSlot: ReturnType<typeof computed<AppointmentSlot | null>>

  const slotsByDay = ref(new Map())

  beforeEach(() => {
    appointmentShape = computed(() => createAppointmentShape())
    selectedSlot = computed(() => createAppointmentSlot())
  })

  function schedulingParams() {
    return {
      appointmentShape,
      selectedSlot,
      propertyDetailsStepData,
      slotsByDay
    }
  }

  describe('hasMoveableParts detection', () => {
    it('should detect moveable parts when totalMoveableDuration > 0', () => {
      appointmentShape = computed(() => createAppointmentShape({ totalMoveableDuration: 30 }))
      
      const { hasMoveableParts } = useMoveablePartsScheduling(schedulingParams())

      expect(hasMoveableParts.value).toBe(true)
    })

    it('should not detect moveable parts when totalMoveableDuration is 0', () => {
      appointmentShape = computed(() => createAppointmentShape({ totalMoveableDuration: 0 }))
      
      const { hasMoveableParts } = useMoveablePartsScheduling(schedulingParams())

      expect(hasMoveableParts.value).toBe(false)
    })

    it('should not detect moveable parts when shape is null', () => {
      appointmentShape = computed(() => null)
      
      const { hasMoveableParts } = useMoveablePartsScheduling(schedulingParams())

      expect(hasMoveableParts.value).toBe(false)
    })
  })

  describe('modal state management', () => {
    it('should initialize with modal closed', () => {
      const { showModal } = useMoveablePartsScheduling(schedulingParams())

      expect(showModal.value).toBe(false)
    })

    it('should open modal when openModal is called', () => {
      const { showModal, openModal } = useMoveablePartsScheduling(schedulingParams())

      openModal()
      expect(showModal.value).toBe(true)
    })

    it('should close modal when closeModal is called', () => {
      const { showModal, openModal, closeModal } = useMoveablePartsScheduling(schedulingParams())

      openModal()
      expect(showModal.value).toBe(true)
      
      closeModal()
      expect(showModal.value).toBe(false)
    })
  })

  describe('contingency period', () => {
    it('should initialize with default contingency period', () => {
      const { contingencyPeriod } = useMoveablePartsScheduling(schedulingParams())

      expect(contingencyPeriod.value.hasContingency).toBe(false)
      expect(contingencyPeriod.value.endDate).toBeNull()
      expect(contingencyPeriod.value.endTime).toBeNull()
    })

    it('should reset contingency period when resetContingency is called', () => {
      const { contingencyPeriod, resetContingency } = useMoveablePartsScheduling(schedulingParams())

      contingencyPeriod.value.hasContingency = true
      contingencyPeriod.value.endDate = '2026-01-20'
      contingencyPeriod.value.endTime = '17:00'

      resetContingency()

      expect(contingencyPeriod.value.hasContingency).toBe(false)
      expect(contingencyPeriod.value.endDate).toBeNull()
      expect(contingencyPeriod.value.endTime).toBeNull()
    })
  })

  describe('slot selection', () => {
    it('should initialize with no selected slot', () => {
      const { selectedSlotIndex } = useMoveablePartsScheduling(schedulingParams())

      expect(selectedSlotIndex.value).toBeNull()
    })

    it('should select slot when selectSlot is called', () => {
      const { selectedSlotIndex, selectSlot } = useMoveablePartsScheduling(schedulingParams())

      selectSlot(2)
      expect(selectedSlotIndex.value).toBe(2)
    })

    it('should update selected slot index', () => {
      const { selectedSlotIndex, selectSlot } = useMoveablePartsScheduling(schedulingParams())

      selectSlot(0)
      expect(selectedSlotIndex.value).toBe(0)

      selectSlot(5)
      expect(selectedSlotIndex.value).toBe(5)
    })
  })

  describe('moveable duration', () => {
    it('should return moveable duration from shape', () => {
      appointmentShape = computed(() => createAppointmentShape({ totalMoveableDuration: 45 }))
      
      const { moveableDuration } = useMoveablePartsScheduling(schedulingParams())

      expect(moveableDuration.value).toBe(45)
    })

    it('should return 0 when shape is null', () => {
      appointmentShape = computed(() => null)
      
      const { moveableDuration } = useMoveablePartsScheduling(schedulingParams())

      expect(moveableDuration.value).toBe(0)
    })
  })

  describe('moveable options calculation', () => {
    it('should return null when no moveable parts', async () => {
      appointmentShape = computed(() => createAppointmentShape({ totalMoveableDuration: 0 }))
      
      const { moveableOptions } = useMoveablePartsScheduling(schedulingParams())

      // Wait for async calculation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(moveableOptions.value).toBeNull()
    })

    it('should return null when no selected slot', async () => {
      appointmentShape = computed(() => createAppointmentShape({ totalMoveableDuration: 30 }))
      selectedSlot = computed(() => null)
      
      const { moveableOptions } = useMoveablePartsScheduling(schedulingParams())

      // Wait for async calculation
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(moveableOptions.value).toBeNull()
    })

    it('should calculate moveable options when conditions are met', async () => {
      appointmentShape = computed(() => createAppointmentShape({ totalMoveableDuration: 30 }))
      selectedSlot = computed(() => createAppointmentSlot({
        totalOnSiteEndTime: '2026-01-15T11:00:00Z'
      }))
      
      const { moveableOptions, isLoadingOptions } = useMoveablePartsScheduling(schedulingParams())

      // Wait for async calculation
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(isLoadingOptions.value).toBe(false)
      expect(moveableOptions.value).not.toBeNull()
      if (moveableOptions.value) {
        expect(moveableOptions.value.moveableDuration).toBe(30)
        expect(moveableOptions.value.innerBoundary).toBe('2026-01-15T11:00:00Z')
        expect(moveableOptions.value.availableSlots).toBeInstanceOf(Array)
        expect(moveableOptions.value.earliestCompletion).toBeTruthy()
      }
    })
  })

  describe('selected moveable slot', () => {
    it('should return null when no slot is selected', async () => {
      appointmentShape = computed(() => createAppointmentShape({ totalMoveableDuration: 30 }))
      
      const { selectedMoveableSlot } = useMoveablePartsScheduling(schedulingParams())

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(selectedMoveableSlot.value).toBeNull()
    })

    it('should return selected slot when index is set', async () => {
      appointmentShape = computed(() => createAppointmentShape({ totalMoveableDuration: 30 }))
      selectedSlot = computed(() => createAppointmentSlot({
        totalOnSiteEndTime: '2026-01-15T11:00:00Z'
      }))
      
      const { selectedMoveableSlot, selectSlot, moveableOptions } = useMoveablePartsScheduling(schedulingParams())

      // Wait for async calculation
      await new Promise(resolve => setTimeout(resolve, 200))

      if (moveableOptions.value && moveableOptions.value.availableSlots.length > 0) {
        selectSlot(0)
        
        expect(selectedMoveableSlot.value).not.toBeNull()
        expect(selectedMoveableSlot.value?.startTime).toBe(moveableOptions.value.availableSlots[0].startTime)
      }
    })
  })
})
