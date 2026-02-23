
import type { Transaction } from 'sequelize'
import { Address, PropertyVersion, PropertyDetails, PropertyVersionType, BlockInstance, BlockShape } from '../../../config/app.js'
import { FIELD_NAMES } from '../entities/entityConstants.js'

/** PropertyVersion with associations loaded (propertyDetails, address). */
type PropertyVersionWithAssociations = InstanceType<typeof PropertyVersion> & {
  propertyDetails?: InstanceType<typeof PropertyDetails> | InstanceType<typeof PropertyDetails>[] | null
  address?: InstanceType<typeof Address> | null
}

/** BlockInstance with block_shape association loaded. */
export type BlockInstanceWithShape = InstanceType<typeof BlockInstance> & {
  block_shape?: { name: string } | null
}

function isPropertyVersionWithAssociations(
  propertyVersion: unknown
): propertyVersion is PropertyVersionWithAssociations {
  return (
    typeof propertyVersion === 'object' &&
    propertyVersion !== null &&
    ('propertyDetails' in propertyVersion || 'address' in propertyVersion)
  )
}

export function isBlockInstanceWithShape(
  blockInstance: unknown
): blockInstance is BlockInstanceWithShape {
  return typeof blockInstance === 'object' && blockInstance !== null && 'block_shape' in blockInstance
}

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

export async function buildPropertyTypeResponse(
  propertyTypeId: string
): Promise<InstanceType<typeof PropertyVersionType> | null> {
  return await PropertyVersionType.findByPk(propertyTypeId, {
    include: [{ model: BlockInstance, as: 'blockInstance' }],
  })
}

export async function getBlockInstanceWithShape(
  blockInstanceId: string
): Promise<BlockInstanceWithShape | null> {
  return await BlockInstance.findByPk(blockInstanceId, {
    include: [{ model: BlockShape, as: 'block_shape' }],
  })
}

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

export async function getPropertyTypesWithAssociations(
  propertyVersionId: string
): Promise<InstanceType<typeof PropertyVersionType>[]> {
  return await PropertyVersionType.findAll({
    where: { propertyVersionId },
    include: [{ model: BlockInstance, as: 'blockInstance' }],
    order: [[FIELD_NAMES.ORDER_INDEX, 'ASC']],
  })
}
