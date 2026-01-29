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
  // Wizard selections (block instances)
  userTypeBlock: BookingBlockInstance | null
  services: BookingBlockInstance[] // Multi-select array - replaces baseService
  propertyTypeBlocks: BookingBlockInstance[] // Multi-select array - replaces propertyTypeBlock
  optionTypeBlocks: BookingBlockInstance[]
  lineItemBlocks: BookingBlockInstance[] // Line item blocks (bookingMode: "addOn")
  
  // Property details form fields
  propertyDetails: {
    address: string
    unit: string
    city: string
    state: string
    zipCode: string
    propertySize: number | null
    numberOfUnits: number | null
    mlsNumber: string
    squareFootage: number | null
    bedrooms: number | null
    bathrooms: number | null
    foundationAccess: 'basement' | 'crawlspace' | 'slab' | null
    additionalUnits: number | null
  }
  
  // Contact form fields
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
  
  // Availability data
  availability: {
    selectedDate: { start: string | null; end: string | null }
    selectedTimeSlots: Array<{ time: string; duration: number }> | null
  }
  
  // Quote mode
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
  differential: boolean
  partInstances: Array<{
    id: string // partInstanceId
    name: string
    baseFee: number
    baseTime: number
    rateOverBaseFee: number
    rateOverBaseTime: number
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
  
  // Use ID-based validation
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
  
  // Preserve previous behavior: keep bookingData.blockInstances ordering.
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
  // Use current instance as base if available, otherwise create minimal structure
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

  // Transform part instances from version format to BookingPartInstance format
  const partInstances: BookingPartInstance[] = version.partInstances.map(pi => {
    // Try to find matching part instance from current instance for metadata
    const currentPart = currentInstance?.partInstances.find(p => p.id === pi.id)
    
    return {
      id: pi.id,
      entityKey: 'partInstance' as const,
      name: pi.name || '',
      baseFee: pi.baseFee,
      baseTime: pi.baseTime,
      rateOverBaseFee: pi.rateOverBaseFee,
      rateOverBaseTime: pi.rateOverBaseTime,
      // Use current part metadata if available, otherwise defaults
      onSite: currentPart?.onSite ?? true,
      clientPresent: currentPart?.clientPresent ?? false,
      moveable: currentPart?.moveable ?? false,
      active: currentPart?.active ?? true,
      orderIndex: currentPart?.orderIndex ?? 0,
      partShape: currentPart?.partShape || '',
      disabled: false, // BookingPartInstance requires disabled field
      zeroOutPart: currentPart?.zeroOutPart ?? false, // BookingPartInstance requires zeroOutPart field
    }
  })

  // Override with version data (these are the versioned fields)
  return {
    ...base,
    id: version.id,
    name: version.name,
    icon: version.icon || '',
    baseSqFt: version.baseSqFt || 0,
    allowMultiple: version.allowMultiple,
    differential: version.differential,
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
   * LEARNING: Use property-based filtering for state control blocks (constituable: false)
   * PATTERN: Find state control block instances, then match by ID
   * VERIFICATION: Log warning if UUID doesn't resolve to correct block type
   */
  const stateControlBlocks = getStateControlBlockInstances(bookingData)
  const userTypeId = appointment.userTypeId
  const userTypeBlock = userTypeId
    ? stateControlBlocks.find(block => block.id === userTypeId)
    : null
  
  // Verify UUID resolution - log warning if userTypeId doesn't resolve
  if (userTypeId && !userTypeBlock) {
    const fallback = findBlockInstanceById(bookingData, userTypeId)
    if (fallback) {
      // Fallback found but shouldn't be used (block shape mismatch)
      console.warn(`[AppointmentTransformer] userTypeId ${userTypeId} resolved to block instance but is not a state control block`)
    } else {
      console.warn(`[AppointmentTransformer] userTypeId ${userTypeId} not found in booking data`)
    }
  }
  
  const userTypeBlockResult = userTypeBlock || null
  
  // Fetch versions if snapshotIds exist
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

  // Session 1.3.9.3: Updated to handle array of service IDs
  const serviceIds = appointment.selectedServiceIds || []
  
  // Find Service block shape ID by type (stable semantic identifier)
  const serviceBlockShapeId = getBlockShapeIdByType(bookingData, BLOCK_SHAPE_TYPES.SERVICE)
  const allServicesFound = findBlockInstancesByIds(bookingData, serviceIds)
  // LEARNING: Filter by type to ensure only Service blocks are returned
  // WHY: Type is immutable and independent of display name, ensures correct blocks
  const servicesFound = serviceBlockShapeId
    ? allServicesFound.filter(
        service => service.blockShapeRef === serviceBlockShapeId
      )
    : allServicesFound // Use all found instances if block shape ID is null
  
  // Verify UUID resolution - log warning if service IDs don't resolve
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
  
  // Use versions if available, otherwise use current instances directly
  let services: BookingBlockInstance[]
  if (versionsData?.services && versionsData.services.length > 0) {
    // Use versions (complete immutable records)
    services = versionsData.services.map(version => {
      const currentInstance = servicesFound.find(s => s.id === version.id) || null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  } else {
    // No versions - use current instances directly
    services = servicesFound
  }
  
  // Session 1.3.9.3: Updated to handle array of property type block IDs
  const propertyTypeBlockIds = appointment.selectedPropertyIds || []
  
  // Find Property block shape ID by type (stable semantic identifier)
  const propertyBlockShapeId = getBlockShapeIdByType(bookingData, BLOCK_SHAPE_TYPES.PROPERTY)
  const allPropertyBlocksFound = findBlockInstancesByIds(bookingData, propertyTypeBlockIds)
  // LEARNING: Filter by type to ensure only Property blocks are returned
  // WHY: Type is immutable and independent of display name, ensures correct blocks
  const propertyTypeBlocksFound = propertyBlockShapeId
    ? allPropertyBlocksFound.filter(
        property => property.blockShapeRef === propertyBlockShapeId
      )
    : allPropertyBlocksFound // Use all found instances if block shape ID is null
  
  // Verify UUID resolution - log warning if property type block IDs don't resolve
  if (propertyTypeBlockIds.length > 0 && propertyTypeBlocksFound.length !== propertyTypeBlockIds.length) {
    const foundIds = new Set(propertyTypeBlocksFound.map(d => d.id))
    const missingIds = propertyTypeBlockIds.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      console.warn(`[AppointmentTransformer] Some property type block IDs not found: ${missingIds.join(', ')}`)
    }
  }
  
  // Use versions if available, otherwise use current instances directly
  let propertyTypeBlocks: BookingBlockInstance[]
  if (versionsData?.properties && versionsData.properties.length > 0) {
    // Use versions
    propertyTypeBlocks = versionsData.properties.map(version => {
      const currentInstance = propertyTypeBlocksFound.find(p => p.id === version.id) || null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  } else {
    // No versions - use current instances directly
    propertyTypeBlocks = propertyTypeBlocksFound
  }
  
  const optionTypeBlockIds = appointment.selectedOptionIds || []
  const optionTypeBlocksFound = findBlockInstancesByIds(
    bookingData,
    optionTypeBlockIds
  )
  
  // Verify UUID resolution - log warning if availability option IDs don't resolve
  if (optionTypeBlockIds.length > 0 && optionTypeBlocksFound.length !== optionTypeBlockIds.length) {
    const foundIds = new Set(optionTypeBlocksFound.map(o => o.id))
    const missingIds = optionTypeBlockIds.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      console.warn(`[AppointmentTransformer] Some availability option IDs not found: ${missingIds.join(', ')}`)
    }
  }
  
  // Use versions if available, otherwise use current instances directly
  let optionTypeBlocks: BookingBlockInstance[]
  if (versionsData?.options && versionsData.options.length > 0) {
    // Use versions
    optionTypeBlocks = versionsData.options.map(version => {
      const currentInstance = optionTypeBlocksFound.find(o => o.id === version.id) || null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  } else {
    // No versions - use current instances directly
    optionTypeBlocks = optionTypeBlocksFound
  }
  
  // LEARNING: Extract line item blocks from appointment (bookingMode: "addOn")
  // WHY: Line items are separate from main booking blocks and stored separately
  // PATTERN: Check for selectedLineItemIds in appointment, filter from bookingData.lineItemBlocks
  // NOTE: Forward-compatible - returns empty array if no line item data exists yet
  const lineItemBlockIds = (appointment as { selectedLineItemIds?: string[] }).selectedLineItemIds || []
  const lineItemBlocksFound = lineItemBlockIds.length > 0 && bookingData.lineItemBlocks
    ? bookingData.lineItemBlocks.filter(block => lineItemBlockIds.includes(block.id))
    : []
  
  // Verify UUID resolution - log warning if line item IDs don't resolve
  if (lineItemBlockIds.length > 0 && lineItemBlocksFound.length !== lineItemBlockIds.length) {
    const foundIds = new Set(lineItemBlocksFound.map(li => li.id))
    const missingIds = lineItemBlockIds.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      console.warn(`[AppointmentTransformer] Some line item IDs not found: ${missingIds.join(', ')}`)
    }
  }
  
  // Use versions if available, otherwise use current instances directly
  let lineItemBlocks: BookingBlockInstance[]
  if (versionsData?.lineItems && versionsData.lineItems.length > 0) {
    // Use versions (if line item versions are supported)
    lineItemBlocks = versionsData.lineItems.map((version: VersionBlockInstance) => {
      const currentInstance = lineItemBlocksFound.find(li => li.id === version.id) || null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  } else {
    // No versions - use current instances directly
    lineItemBlocks = lineItemBlocksFound
  }
  
  // Map property data (from propertyVersion relationship)
  // LEARNING: Uses new three-table structure (propertyVersion → address + propertyDetails)
  // WHY: Property data is stored in normalized propertyVersion structure
  const propertyVersion = appointment.propertyVersion
  const address = propertyVersion?.address
  const propertyDetailsArray = propertyVersion?.propertyDetails
  
  // Extract property details record (first item if array, otherwise the value itself)
  const propertyDetailsRecord = Array.isArray(propertyDetailsArray)
    ? propertyDetailsArray[0] // Use first/latest property details
    : propertyDetailsArray ?? null
  
  // LEARNING: Helper to safely extract string values from nested objects
  // WHY: Prevents [object Object] from appearing in form fields when objects are stored instead of primitives
  // PATTERN: Check if value is a string, otherwise return empty string (don't try to extract from objects)
  const extractString = (value: unknown): string => {
    if (typeof value === 'string') return value
    return ''
  }
  
  // LEARNING: Helper to safely extract number values from nested objects
  // WHY: Prevents [object Object] from appearing in form fields when objects are stored instead of primitives
  // PATTERN: Check if value is a number, otherwise return null (don't try to extract from objects)
  // NOTE: Function removed as it's not currently used - kept comment for future reference
  
  // Extract foundation access with proper type checking
  const extractFoundationAccess = (value: unknown): 'basement' | 'crawlspace' | 'slab' | null => {
    if (typeof value === 'string' && (value === 'basement' || value === 'crawlspace' || value === 'slab')) {
      return value
    }
    return null
  }
  
  // Property details extraction from propertyVersion structure
  const propertyDetails = {
    // Address fields from propertyVersion.address
    address: address?.address ?? '',
    unit: address?.unit ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    zipCode: address?.zipCode ?? '',
    
    // Property details from propertyVersion.propertyDetails[0]
    propertySize: propertyDetailsRecord?.squareFootage ?? null,
    numberOfUnits: propertyDetailsRecord?.additionalUnits ?? null,
    mlsNumber: extractString(propertyDetailsRecord?.mlsNumber),
    squareFootage: propertyDetailsRecord?.squareFootage ?? null,
    bedrooms: propertyDetailsRecord?.bedrooms ?? null,
    bathrooms: propertyDetailsRecord?.bathrooms ?? null,
    foundationAccess: extractFoundationAccess(propertyDetailsRecord?.foundationAccess),
    additionalUnits: propertyDetailsRecord?.additionalUnits ?? null,
  }
  
  // Map contact data (from relationships or additionalContacts)
  const client = appointment.client
  const agent = appointment.agent
  const additionalContacts = appointment.additionalContacts || []
  
  // Map additional contacts to role-based structure
  const mappedAdditionalContacts = additionalContacts.map((contact: Record<string, unknown>) => {
    // Try to determine role from contact data or default to anotherClient
    const role = (contact.role as string) || 'anotherClient'
    return {
      firstName: (contact.firstName as string) || '',
      lastName: (contact.lastName as string) || '',
      email: (contact.email as string) || '',
      role: role as 'anotherClient' | 'transactionManager' | 'seller'
    }
  })
  
  const contacts = {
    client: {
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      email: client?.email || '',
    },
    agent: {
      firstName: agent?.firstName || '',
      lastName: agent?.lastName || '',
      email: agent?.email || '',
    },
    additionalContacts: mappedAdditionalContacts,
  }
  
  // Map availability data
  const selectedDate = {
    start: appointment.selectedDate || null,
    end: appointment.selectedDateRangeEnd || null,
  }
  
  // Transform time slots from appointment format to wizard format
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

