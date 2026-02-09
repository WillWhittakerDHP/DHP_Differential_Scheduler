/**
 * Appointment to Wizard Transformer
 * 
 * LEARNING: Transforms appointment API response to wizard state format
 * WHY: Enables loading existing appointments into wizard for testing/editing
 * PATTERN: Transformer function that maps appointment data to wizard state
 * 
 * Phase 1.2.3: Created for mock data loading functionality
 */

import type { AppointmentResponse } from '@/types/appointment'
import type { BookingBlockInstance, BookingPartInstance } from './globalToBookingTransformer'
import type { BookingData } from './globalToBookingTransformer'
import type { RFC3339DateTime } from '@/types/datetime'
import type { TernaryBoolean } from '@/types/ternary'
import { findById } from '@/utils/collections/findById'
import { findBlockInstanceByIdAndShapeId, getBlockShapeIdByType, getStateControlBlockInstances } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import apiClient from '@/utils/api'
import { getAppointmentVersionsEndpoint } from '@/utils/api'

/**
 * Wizard state data structure
 * LEARNING: Represents all wizard state that can be populated from appointment
 * WHY: Type-safe structure for loading appointment data into wizard
 */
export interface WizardStateData {
  userTypeBlock: BookingBlockInstance | null
  services: BookingBlockInstance[] // Multi-select array - replaces baseService
  propertyTypeBlocks: BookingBlockInstance[] // Multi-select array - replaces propertyTypeBlock
  optionTypeBlocks: BookingBlockInstance[]
  lineItemBlocks: BookingBlockInstance[] // Line item blocks (bookingMode: "addOn")
  
  propertyDetails: {
    address: string
    unit: string
    city: string
    state: string
    zipCode: string
    placeId?: string
    coordinates?: { lat: number; lng: number }
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
    client: {
      firstName: string
      lastName: string
      email: string
    }
    agent: {
      firstName: string
      lastName: string
      email: string
    }
    additionalContacts: Array<{
      firstName: string
      lastName: string
      email: string
      role: 'anotherClient' | 'transactionManager' | 'seller'
    }>
  }
  
  availability: {
    selectedDate: { start: string | null; end: string | null }
    selectedTimeSlots: Array<{ time: string; duration: number }> | null
  }
  
  isQuoteMode: boolean
}

/**
 * Version data structure from API
 * LEARNING: Matches server-side version format
 */
interface VersionBlockInstance {
  id: string // blockInstanceId
  name: string
  icon: string
  baseSqFt: number
  allowMultiple: boolean
  differential: boolean | TernaryBoolean // LEARNING: May be boolean (legacy) or TernaryBoolean
  partInstances: Array<{
    id: string // partInstanceId
    name: string
    baseFee: number
    baseTime: number
    rateOverBaseFee: number
    rateOverBaseTime: number
    onSite?: boolean | TernaryBoolean // LEARNING: May be boolean (legacy) or TernaryBoolean
    clientPresent?: boolean | TernaryBoolean // LEARNING: May be boolean (legacy) or TernaryBoolean
  }>
}

interface AppointmentVersionsResponse {
  services: VersionBlockInstance[]
  properties: VersionBlockInstance[]
  options: VersionBlockInstance[]
  lineItems?: VersionBlockInstance[]
}

/**
 * Find block instance by ID in scheduler data
 * LEARNING: Helper to find block instance from scheduler data
 * WHY: Maps appointment IDs to BookingBlockInstance objects
 * PATTERN: Search through blockInstances array
 */
function findBlockInstanceById(
  bookingData: BookingData,
  id: string | null | undefined
): BookingBlockInstance | null {
  if (!id || !bookingData) return null
  
  const blockInstance = findById(bookingData.blockInstances, id) || null
  return blockInstance
}

/**
 * Find block instance by ID and blockShape ID in scheduler data
 * LEARNING: Helper to find block instance with type validation using block shape ID
 * WHY: Ensures we find the correct block instance type (e.g., userTypeBlock vs baseService) using ID-based filtering
 * PATTERN: Use generic utility that validates block shape ID match
 * NOTE: Replaced name-based filtering with ID-based filtering for consistency
 * NOTE: Currently unused but kept for future migration support
 */
 
// @ts-expect-error - Unused function kept for future migration support
function _findBlockInstanceByIdAndShapeName(
  bookingData: BookingData,
  id: string | null | undefined,
  expectedBlockShapeName: string
): BookingBlockInstance | null {
  if (!id || !bookingData) return null
  
  // Find block shape ID by name (fallback for migration period)
  const blockShapeId = getBlockShapeIdByName(bookingData, expectedBlockShapeName)
  if (!blockShapeId) {
    return null
  }
  
  return findBlockInstanceByIdAndShapeId(bookingData, id, blockShapeId)
}

/**
 * Find multiple block instances by IDs
 * LEARNING: Helper to find multiple block instances
 * WHY: Maps array of IDs to array of BookingBlockInstance objects
 * PATTERN: Filter blockInstances array by IDs
 */
function findBlockInstancesByIds(
  bookingData: BookingData,
  ids: string[] | null | undefined
): BookingBlockInstance[] {
  if (!ids || !bookingData || ids.length === 0) return []
  
  const requestedIds = new Set(ids.map((id) => String(id)))
  const found = bookingData.blockInstances.filter((bi) => requestedIds.has(String(bi.id)))

  return found
}

/**
 * Transform version data to BookingBlockInstance format
 * LEARNING: Versions are complete immutable records, but need metadata from current instance
 * WHY: Versions contain versioned fields, but BookingBlockInstance needs additional metadata
 * PATTERN: Merge version data with current instance metadata
 */
function transformVersionToBookingInstance(
  version: VersionBlockInstance,
  currentInstance: BookingBlockInstance | null,
  bookingData: BookingData
): BookingBlockInstance {
  // FIX: bookingData parameter is kept for API consistency but not currently used in this function
  void bookingData
  const base: Partial<BookingBlockInstance> = currentInstance || {
    id: version.id,
    entityKey: 'blockInstance' as const,
    active: true,
    bookingMode: 'standalone',
    orderIndex: 0,
    blockShape: '',
    blockShapeRef: '',
    activeBlockIds: [],
    partInstances: [],
    requiresUnitNumber: null,
  }

  // LEARNING: Convert boolean to TernaryBoolean for backward compatibility
  // PATTERN: Convert boolean to TernaryBoolean, default to 'false'
  const convertToTernary = (value: TernaryBoolean | boolean | undefined, defaultValue: TernaryBoolean = 'false'): TernaryBoolean => {
    if (value === true) return 'true'
    if (value === false) return 'false'
    if (value === 'true' || value === 'false' || value === 'override') return value
    return defaultValue
  }

  const partInstances: BookingPartInstance[] = version.partInstances.map(pi => {
    const currentPart = currentInstance?.partInstances.find(p => p.id === pi.id)
    
    return {
      id: pi.id,
      entityKey: 'partInstance' as const,
      name: pi.name || '',
      baseFee: pi.baseFee,
      baseTime: pi.baseTime,
      rateOverBaseFee: pi.rateOverBaseFee,
      rateOverBaseTime: pi.rateOverBaseTime,
      // PATTERN: Events should be accessed via EventAssignment relationships instead
      active: currentPart?.active ?? true,
      orderIndex: currentPart?.orderIndex ?? 0,
      partShape: currentPart?.partShape || '',
      disabled: false, // BookingPartInstance requires disabled field
      zeroOutPart: currentPart?.zeroOutPart ?? false, // BookingPartInstance requires zeroOutPart field
    }
  })

  return {
    ...base,
    id: version.id,
    name: version.name,
    icon: version.icon || '',
    baseSqFt: version.baseSqFt || 0,
    allowMultiple: version.allowMultiple,
    // LEARNING: Convert boolean to TernaryBoolean for differential
    differential: convertToTernary(version.differential, 'false'),
    partInstances,
  } as BookingBlockInstance
}

/**
 * Transform appointment response to wizard state data
 * LEARNING: Main transformer function that maps appointment to wizard state
 * WHY: Enables loading appointment data into wizard for testing
 * PATTERN: Extract data from appointment and map to wizard state structure
 * 
 * @param appointment - Appointment response from API (includes relationships)
 * @param bookingData - Scheduler data containing block instances
 * @returns Wizard state data ready to populate wizard
 */
export async function transformAppointmentToWizard(
  appointment: AppointmentResponse,
  bookingData: BookingData
): Promise<WizardStateData> {
  
  /**
   * WHY: Prevents matching wrong block types (e.g., baseService ID in userTypeId field)
   * LEARNING: Use property-based filtering for state control blocks (isStateControl: true)
   * PATTERN: Find state control block instances, then match by ID
   * VERIFICATION: Log warning if UUID doesn't resolve to correct block type
   */
  const stateControlBlocks = getStateControlBlockInstances(bookingData)
  const userTypeId = appointment.userTypeId
  const userTypeBlock = userTypeId
    ? stateControlBlocks.find(block => block.id === userTypeId)
    : null
  
  if (userTypeId && !userTypeBlock) {
    const fallback = findBlockInstanceById(bookingData, userTypeId)
    if (fallback) {
      console.warn(`[AppointmentTransformer] userTypeId ${userTypeId} resolved to block instance but is not a state control block`)
    } else {
      console.warn(`[AppointmentTransformer] userTypeId ${userTypeId} not found in booking data`)
    }
  }
  
  const userTypeBlockResult = userTypeBlock || null
  
  let versionsData: AppointmentVersionsResponse | null = null
  if (appointment.serviceSnapshotIds || appointment.propertySnapshotIds || appointment.optionSnapshotIds) {
    try {
      const versionsResponse = await apiClient.get<AppointmentVersionsResponse>(
        getAppointmentVersionsEndpoint(appointment.id)
      )
      versionsData = versionsResponse.data
    } catch (error) {
      console.error('[AppointmentTransformer] Failed to fetch versions:', error)
      throw error
    }
  }

  const serviceIds = appointment.selectedServiceIds || []
  
  const serviceBlockShapeId = getBlockShapeIdByType(bookingData, BLOCK_SHAPE_TYPES.SERVICE)
  const allServicesFound = findBlockInstancesByIds(bookingData, serviceIds)
  const servicesFound = serviceBlockShapeId
    ? allServicesFound.filter(
        service => service.blockShapeRef === serviceBlockShapeId
      )
    : allServicesFound // Use all found instances if block shape ID is null
  
  if (serviceIds.length > 0 && servicesFound.length !== serviceIds.length) {
    const foundIds = new Set(servicesFound.map(s => s.id))
    const missingIds = serviceIds.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      console.warn(`[AppointmentTransformer] Some service IDs not found: ${missingIds.join(', ')}`)
    }
    if (serviceBlockShapeId && servicesFound.length < serviceIds.length) {
      const wrongShapeIds = serviceIds.filter(id => {
        const instance = findBlockInstanceById(bookingData, id)
        return instance && instance.blockShapeRef !== serviceBlockShapeId
      })
      if (wrongShapeIds.length > 0) {
        console.warn(`[AppointmentTransformer] Some service IDs have wrong block shape: ${wrongShapeIds.join(', ')}`)
      }
    }
  }
  
  let services: BookingBlockInstance[]
  if (versionsData?.services && versionsData.services.length > 0) {
    services = versionsData.services.map(version => {
      const currentInstance = servicesFound.find(s => s.id === version.id) || null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  } else {
    services = servicesFound
  }
  
  const propertyTypeBlockIds = appointment.selectedPropertyIds || []
  
  const propertyBlockShapeId = getBlockShapeIdByType(bookingData, BLOCK_SHAPE_TYPES.PROPERTY)
  const allPropertyBlocksFound = findBlockInstancesByIds(bookingData, propertyTypeBlockIds)
  const propertyTypeBlocksFound = propertyBlockShapeId
    ? allPropertyBlocksFound.filter(
        property => property.blockShapeRef === propertyBlockShapeId
      )
    : allPropertyBlocksFound // Use all found instances if block shape ID is null
  
  if (propertyTypeBlockIds.length > 0 && propertyTypeBlocksFound.length !== propertyTypeBlockIds.length) {
    const foundIds = new Set(propertyTypeBlocksFound.map(d => d.id))
    const missingIds = propertyTypeBlockIds.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      console.warn(`[AppointmentTransformer] Some property type block IDs not found: ${missingIds.join(', ')}`)
    }
  }
  
  let propertyTypeBlocks: BookingBlockInstance[]
  if (versionsData?.properties && versionsData.properties.length > 0) {
    propertyTypeBlocks = versionsData.properties.map(version => {
      const currentInstance = propertyTypeBlocksFound.find(p => p.id === version.id) || null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  } else {
    propertyTypeBlocks = propertyTypeBlocksFound
  }
  
  const optionTypeBlockIds = appointment.selectedOptionIds || []
  const optionTypeBlocksFound = findBlockInstancesByIds(
    bookingData,
    optionTypeBlockIds
  )
  
  if (optionTypeBlockIds.length > 0 && optionTypeBlocksFound.length !== optionTypeBlockIds.length) {
    const foundIds = new Set(optionTypeBlocksFound.map(o => o.id))
    const missingIds = optionTypeBlockIds.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      console.warn(`[AppointmentTransformer] Some availability option IDs not found: ${missingIds.join(', ')}`)
    }
  }
  
  let optionTypeBlocks: BookingBlockInstance[]
  if (versionsData?.options && versionsData.options.length > 0) {
    optionTypeBlocks = versionsData.options.map(version => {
      const currentInstance = optionTypeBlocksFound.find(o => o.id === version.id) || null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  } else {
    optionTypeBlocks = optionTypeBlocksFound
  }
  
  // PATTERN: Check for selectedLineItemIds in appointment, filter from bookingData.lineItemBlocks
  const lineItemBlockIds = (appointment as { selectedLineItemIds?: string[] }).selectedLineItemIds || []
  const lineItemBlocksFound = lineItemBlockIds.length > 0 && bookingData.lineItemBlocks
    ? bookingData.lineItemBlocks.filter(block => lineItemBlockIds.includes(block.id))
    : []
  
  if (lineItemBlockIds.length > 0 && lineItemBlocksFound.length !== lineItemBlockIds.length) {
    const foundIds = new Set(lineItemBlocksFound.map(li => li.id))
    const missingIds = lineItemBlockIds.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      console.warn(`[AppointmentTransformer] Some line item IDs not found: ${missingIds.join(', ')}`)
    }
  }
  
  let lineItemBlocks: BookingBlockInstance[]
  if (versionsData?.lineItems && versionsData.lineItems.length > 0) {
    lineItemBlocks = versionsData.lineItems.map((version: VersionBlockInstance) => {
      const currentInstance = lineItemBlocksFound.find(li => li.id === version.id) || null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  } else {
    lineItemBlocks = lineItemBlocksFound
  }
  
  const propertyVersion = appointment.propertyVersion
  const address = propertyVersion?.address
  const propertyDetailsArray = propertyVersion?.propertyDetails
  
  const propertyDetailsRecord = Array.isArray(propertyDetailsArray)
    ? propertyDetailsArray[0] // Use first/latest property details
    : propertyDetailsArray ?? null
  
  // PATTERN: Check if value is a string, otherwise return empty string (don't try to extract from objects)
  const extractString = (value: unknown): string => {
    if (typeof value === 'string') return value
    return ''
  }
  
  // PATTERN: Check if value is a number, otherwise return null (don't try to extract from objects)
  
  const extractFoundationAccess = (value: unknown): 'basement' | 'crawlspace' | 'slab' | null => {
    if (typeof value === 'string' && (value === 'basement' || value === 'crawlspace' || value === 'slab')) {
      return value
    }
    return null
  }
  
  const extractedPlaceId = typeof address?.placeId === 'string' ? address.placeId : undefined
  const extractedCoordinates = (address?.latitude != null && address?.longitude != null)
    ? { lat: Number(address.latitude), lng: Number(address.longitude) }
    : undefined
  
  const propertyDetails = {
    address: address?.address ?? '',
    unit: address?.unit ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    zipCode: address?.zipCode ?? '',
    // LEARNING: Extract placeId and coordinates from address object
    // WHY: These are needed for drive time calculations and API orchestrator
    // PATTERN: Extract from address object if available, otherwise undefined
    placeId: extractedPlaceId,
    coordinates: extractedCoordinates,
    
    propertySize: propertyDetailsRecord?.squareFootage ?? null,
    numberOfUnits: propertyDetailsRecord?.additionalUnits ?? null,
    mlsNumber: extractString(propertyDetailsRecord?.mlsNumber),
    squareFootage: propertyDetailsRecord?.squareFootage ?? null,
    bedrooms: propertyDetailsRecord?.bedrooms ?? null,
    bathrooms: propertyDetailsRecord?.bathrooms ?? null,
    foundationAccess: extractFoundationAccess(propertyDetailsRecord?.foundationAccess),
    additionalUnits: propertyDetailsRecord?.additionalUnits ?? null,
  }
  
  // Extract client and agent from attendees array
  const clientAttendee = appointment.attendees?.find(a => 
    a.userTypeBlockInstance?.name === 'Client' || a.user?.userRole === 'client'
  )
  const agentAttendee = appointment.attendees?.find(a => 
    a.userTypeBlockInstance?.name === 'Agent' || a.user?.userRole === 'agent'
  )
  
  const otherAttendees = appointment.attendees?.filter(a => 
    a.userTypeBlockInstance?.name !== 'Client' && 
    a.userTypeBlockInstance?.name !== 'Agent' &&
    a.user?.userRole !== 'client' &&
    a.user?.userRole !== 'agent'
  ) || []
  
  const mappedAdditionalContacts = otherAttendees.map((attendee) => {
    const user = attendee.user
    const role = attendee.userTypeBlockInstance?.name?.toLowerCase() || 'anotherClient'
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: role as 'anotherClient' | 'transactionManager' | 'seller'
    }
  })
  
  const contacts = {
    client: {
      firstName: clientAttendee?.user?.firstName || '',
      lastName: clientAttendee?.user?.lastName || '',
      email: clientAttendee?.user?.email || '',
    },
    agent: {
      firstName: agentAttendee?.user?.firstName || '',
      lastName: agentAttendee?.user?.lastName || '',
      email: agentAttendee?.user?.email || '',
    },
    additionalContacts: mappedAdditionalContacts,
  }
  
  const selectedDate = {
    start: appointment.selectedDate || null,
    end: appointment.selectedDateRangeEnd || null,
  }
  
  // LEARNING: WizardStateData expects { time: string; duration: number } format
  // WHY: Transform from { startTime, endTime, duration } to { time, duration } format
  const selectedTimeSlots = appointment.selectedTimeSlots
    ? appointment.selectedTimeSlots.map((slot: Record<string, unknown>) => ({
        time: (slot.startTime as RFC3339DateTime) || '',
        duration: (slot.duration as number) || 0
      }))
    : null
  
  const availability = {
    selectedDate,
    selectedTimeSlots,
  }
  
  const result: WizardStateData = {
    userTypeBlock: userTypeBlockResult,
    services,
    propertyTypeBlocks,
    optionTypeBlocks,
    lineItemBlocks,
    propertyDetails,
    contacts,
    availability,
    isQuoteMode: appointment.isQuoteMode || false,
  }
  
  return result
}

