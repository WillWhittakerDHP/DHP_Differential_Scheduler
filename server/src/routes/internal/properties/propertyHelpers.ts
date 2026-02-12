/**
 * Property Router Helper Functions
 * 
 * LEARNING: Extracted helper functions for property operations
 * WHY: Improves code reusability, eliminates `as any` casts, improves type safety
 * PATTERN: Pure helper functions with proper type guards
 */

import type { Transaction } from 'sequelize'
import { Address, PropertyVersion, PropertyDetails, PropertyVersionType, BlockInstance, BlockShape } from '../../../config/app.js'
import { FIELD_NAMES } from '../entities/entityConstants.js'

/** PropertyVersion with associations loaded (propertyDetails, address). */
export type PropertyVersionWithAssociations = InstanceType<typeof PropertyVersion> & {
  propertyDetails?: InstanceType<typeof PropertyDetails> | InstanceType<typeof PropertyDetails>[] | null
  address?: InstanceType<typeof Address> | null
}

/** BlockInstance with block_shape association loaded. */
export type BlockInstanceWithShape = InstanceType<typeof BlockInstance> & {
  block_shape?: { name: string } | null
}

/**
 * Type guard for PropertyVersion with associations
 * LEARNING: Type guard to safely access Sequelize associations
 * WHY: Replaces `as any` casts with type-safe checks
 * PATTERN: Type predicate function that narrows type based on runtime check
 *
 * @param propertyVersion - PropertyVersion instance
 * @returns true if propertyVersion has propertyDetails association
 */
export function isPropertyVersionWithAssociations(
  propertyVersion: unknown
): propertyVersion is PropertyVersionWithAssociations {
  return (
    typeof propertyVersion === 'object' &&
    propertyVersion !== null &&
    ('propertyDetails' in propertyVersion || 'address' in propertyVersion)
  )
}

/**
 * Type guard for BlockInstance with block_shape association
 * LEARNING: Type guard to safely access Sequelize associations
 * WHY: Replaces `as any` casts with type-safe checks
 * PATTERN: Type predicate function that narrows type based on runtime check
 *
 * @param blockInstance - BlockInstance instance
 * @returns true if blockInstance has block_shape association
 */
export function isBlockInstanceWithShape(
  blockInstance: unknown
): blockInstance is BlockInstanceWithShape {
  return typeof blockInstance === 'object' && blockInstance !== null && 'block_shape' in blockInstance
}

/**
 * Extract propertyDetails from PropertyVersion association
 * LEARNING: Type-safe extraction of Sequelize association data
 * WHY: Replaces `as any` pattern with proper type handling
 * PATTERN: Type guard + safe property access
 *
 * @param propertyVersion - PropertyVersion with associations
 * @returns PropertyDetails or null
 */
export function getPropertyDetailsFromVersion(
  propertyVersion: unknown
): InstanceType<typeof PropertyDetails> | null {
  if (!isPropertyVersionWithAssociations(propertyVersion)) {
    return null
  }
  
  const details = (propertyVersion as PropertyVersionWithAssociations).propertyDetails
  if (Array.isArray(details)) {
    return details[0] ?? null
  }
  return details ?? null
}

/**
 * Find or create an address record
 * LEARNING: Extracted address find-or-create logic
 * WHY: Reusable address management, ensures address uniqueness
 * PATTERN: Check existence first, create if not found
 * 
 * @param addressData - Address data object
 * @returns Address instance (existing or newly created)
 */
export async function findOrCreateAddress(addressData: {
  address: string
  unit?: string | null
  city: string
  state: string
  zipCode: string
  placeId?: string | null
  latitude?: number | null
  longitude?: number | null
}): Promise<InstanceType<typeof Address>> {
  const existingAddress = await Address.findOne({
    where: {
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      unit: addressData.unit || null,
    },
  })

  if (existingAddress) {
    return existingAddress
  }

  return await Address.create({
    address: addressData.address,
    unit: addressData.unit || null,
    city: addressData.city,
    state: addressData.state,
    zipCode: addressData.zipCode,
    placeId: addressData.placeId || null,
    latitude: addressData.latitude || null,
    longitude: addressData.longitude || null,
  })
}

/**
 * Get property version with associations loaded
 * LEARNING: Common pattern for loading property with includes
 * WHY: Reusable property loading logic, ensures consistent includes
 * PATTERN: Sequelize findByPk with include options
 * 
 * @param propertyVersionId - Property version ID
 * @param transaction - Optional Sequelize transaction
 * @returns PropertyVersion with associations or null
 */
export async function getPropertyWithAssociations(
  propertyVersionId: string,
  transaction?: Transaction
): Promise<PropertyVersionWithAssociations | null> {
  return await PropertyVersion.findByPk(propertyVersionId, {
    include: [
      { model: Address, as: 'address' },
      { model: PropertyDetails, as: 'propertyDetails' },
    ],
    transaction,
  })
}

/**
 * Build property type response with block instance included
 * LEARNING: Common pattern for property type responses
 * WHY: Reusable response building logic, ensures consistent includes
 * PATTERN: Sequelize findByPk with include options
 * 
 * @param propertyTypeId - Property type ID
 * @returns PropertyVersionType with blockInstance association or null
 */
export async function buildPropertyTypeResponse(
  propertyTypeId: string
): Promise<InstanceType<typeof PropertyVersionType> | null> {
  return await PropertyVersionType.findByPk(propertyTypeId, {
    include: [{ model: BlockInstance, as: 'blockInstance' }],
  })
}

/**
 * Get block instance with block_shape association
 * LEARNING: Common pattern for loading block instance with shape
 * WHY: Reusable block instance loading logic, ensures consistent includes
 * PATTERN: Sequelize findByPk with include options
 * 
 * @param blockInstanceId - Block instance ID
 * @returns BlockInstance with block_shape association or null
 */
export async function getBlockInstanceWithShape(
  blockInstanceId: string
): Promise<BlockInstanceWithShape | null> {
  return await BlockInstance.findByPk(blockInstanceId, {
    include: [{ model: BlockShape, as: 'block_shape' }],
  })
}

/**
 * Create property types in bulk within a transaction
 * LEARNING: Extracted bulk creation logic for property types
 * WHY: Reduces complexity in route handler, improves testability
 * PATTERN: Transaction wrapper with bulk create operation
 * 
 * @param propertyVersionId - Property version ID
 * @param blockInstanceIds - Array of block instance IDs
 * @param transaction - Sequelize transaction
 */
export async function createPropertyTypesBulk(
  propertyVersionId: string,
  blockInstanceIds: string[],
  transaction: Transaction
): Promise<void> {
  await PropertyVersionType.destroy({
    where: { propertyVersionId },
    transaction,
  })
  
  if (blockInstanceIds.length > 0) {
    await PropertyVersionType.bulkCreate(
      blockInstanceIds.map((blockInstanceId: string, index: number) => ({
        propertyVersionId,
        blockInstanceId,
        orderIndex: index,
      })),
      { transaction }
    )
  }
}

/**
 * Get all property types for a property version with associations
 * LEARNING: Common pattern for fetching property types with block instances
 * WHY: Reusable property type fetching logic, ensures consistent includes
 * PATTERN: Sequelize findAll with includes, ordered by orderIndex
 * 
 * @param propertyVersionId - Property version ID
 * @returns Array of PropertyVersionType with blockInstance associations
 */
export async function getPropertyTypesWithAssociations(
  propertyVersionId: string
): Promise<InstanceType<typeof PropertyVersionType>[]> {
  return await PropertyVersionType.findAll({
    where: { propertyVersionId },
    include: [{ model: BlockInstance, as: 'blockInstance' }],
    order: [[FIELD_NAMES.ORDER_INDEX, 'ASC']],
  })
}
