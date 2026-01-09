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
import type { BookingBlockInstance } from './globalToBookingTransformer'
import type { BookingData } from './globalToBookingTransformer'
import { findById } from '@/utils/collections/findById'
import { findBlockInstanceByIdAndShapeId, getBlockShapeIdByType, getStateControlBlockInstances } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { mergeSnapshotWithCurrent } from './snapshotToBookingInstance'

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
 * Transform appointment response to wizard state data
 * LEARNING: Main transformer function that maps appointment to wizard state
 * WHY: Enables loading appointment data into wizard for testing
 * PATTERN: Extract data from appointment and map to wizard state structure
 * 
 * @param appointment - Appointment response from API (includes relationships)
 * @param bookingData - Scheduler data containing block instances
 * @returns Wizard state data ready to populate wizard
 */
export function transformAppointmentToWizard(
  appointment: AppointmentResponse,
  bookingData: BookingData
): WizardStateData {
  
  /**
   * WHY: Prevents matching wrong block types (e.g., baseService ID in userTypeId field)
   * LEARNING: Use property-based filtering for state control blocks (constituable: false)
   * PATTERN: Find state control block instances, then match by ID
   * VERIFICATION: Log warning if UUID doesn't resolve to correct block type
   * NOTE: Check both userTypeId (actual API field) and userTypeBlockId (backward compatibility)
   */
  const stateControlBlocks = getStateControlBlockInstances(bookingData)
  const userTypeId = appointment.userTypeId || appointment.userTypeBlockId
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
  
  // Session 1.3.9.3: Updated to handle array of service IDs
  // NOTE: baseServiceId doesn't exist in the codebase - removed fallback
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
  
  // LEARNING: Merge snapshots with current instances for historical accuracy
  // WHY: Preserves pricing/names at booking time
  // PATTERN: Use snapshot if available, otherwise use current instance
  const services = servicesFound.map(service => 
    mergeSnapshotWithCurrent(service, appointment.serviceSnapshots?.[service.id])
  )
  
  // Session 1.3.9.3: Updated to handle array of property type block IDs
  // Support backward compatibility: check new field first (selectedPropertyIds), then old (selectedPropertyTypeBlockIds), then legacy (propertyTypeBlockId)
  const propertyTypeBlockIds = appointment.selectedPropertyIds || appointment.selectedPropertyTypeBlockIds || (appointment.propertyTypeBlockId ? [appointment.propertyTypeBlockId] : [])
  
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
  
  // LEARNING: Merge snapshots with current instances for historical accuracy
  const propertyTypeBlocks = propertyTypeBlocksFound.map(property =>
    mergeSnapshotWithCurrent(property, appointment.propertySnapshots?.[property.id])
  )
  
  // Support backward compatibility: check new field first (selectedOptionIds), then old (selectedOptionTypeBlocks)
  const optionTypeBlockIds = appointment.selectedOptionIds || appointment.selectedOptionTypeBlocks || []
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
  
  // LEARNING: Merge snapshots with current instances for historical accuracy
  // Support backward compatibility: check new field first (optionSnapshots), then old (optionTypeBlockSnapshots)
  const optionSnapshots = appointment.optionSnapshots || appointment.optionTypeBlockSnapshots
  const optionTypeBlocks = optionTypeBlocksFound.map(option =>
    mergeSnapshotWithCurrent(option, optionSnapshots?.[option.id])
  )
  
  // Map property data (from propertyVersion relationship or propertyDetails)
  // LEARNING: Updated to use new three-table structure (propertyVersion → address + propertyDetails)
  // WHY: Supports new property structure while maintaining backward compatibility
  // FIX: Properly extract property details from propertyVersion relationship to prevent [object Object] display
  const propertyVersion = appointment.propertyVersion
  const address = propertyVersion?.address
  const propertyDetailsArray = propertyVersion?.propertyDetails
  
  // Extract property details record (first item if array, otherwise the value itself)
  const propertyDetailsRecord = Array.isArray(propertyDetailsArray)
    ? propertyDetailsArray[0] // Use first/latest property details
    : propertyDetailsArray ?? null
  
  // Fallback to deprecated property only if propertyVersion doesn't exist
  const legacyProperty = !propertyVersion ? appointment.property : null
  const legacyPropertyDetails = Array.isArray(legacyProperty) ? legacyProperty[0] : legacyProperty
  
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
  
  // Property details extraction - prioritize propertyVersion, fallback to legacy property
  const propertyDetails = {
    // Address fields from propertyVersion.address (or legacy property)
    address: address?.address ?? legacyProperty?.address ?? '',
    unit: address?.unit ?? legacyProperty?.unit ?? '',
    city: address?.city ?? legacyProperty?.city ?? '',
    state: address?.state ?? legacyProperty?.state ?? '',
    zipCode: address?.zipCode ?? legacyProperty?.zipCode ?? '',
    
    // Property details from propertyVersion.propertyDetails[0] (or legacy property)
    propertySize: propertyDetailsRecord?.squareFootage ?? legacyPropertyDetails?.squareFootage ?? null,
    numberOfUnits: propertyDetailsRecord?.additionalUnits ?? legacyPropertyDetails?.additionalUnits ?? null,
    mlsNumber: extractString(propertyDetailsRecord?.mlsNumber ?? legacyPropertyDetails?.mlsNumber),
    squareFootage: propertyDetailsRecord?.squareFootage ?? legacyPropertyDetails?.squareFootage ?? null,
    bedrooms: propertyDetailsRecord?.bedrooms ?? legacyPropertyDetails?.bedrooms ?? null,
    bathrooms: propertyDetailsRecord?.bathrooms ?? legacyPropertyDetails?.bathrooms ?? null,
    foundationAccess: extractFoundationAccess(propertyDetailsRecord?.foundationAccess ?? legacyPropertyDetails?.foundationAccess),
    additionalUnits: propertyDetailsRecord?.additionalUnits ?? legacyPropertyDetails?.additionalUnits ?? null,
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
  const selectedTimeSlots = appointment.selectedTimeSlots
    ? appointment.selectedTimeSlots.map((slot: Record<string, unknown>) => ({
        time: (slot.time as string) || '',
        duration: (slot.duration as number) || 90,
      }))
    : null
  
  const availability = {
    selectedDate,
    selectedTimeSlots,
  }
  
  const result = {
    userTypeBlock: userTypeBlockResult,
    services,
    propertyTypeBlocks,
    optionTypeBlocks,
    propertyDetails,
    contacts,
    availability,
    isQuoteMode: appointment.isQuoteMode || false,
  }
  
  return result
}

