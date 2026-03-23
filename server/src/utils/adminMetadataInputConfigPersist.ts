/**
 * Persist API inputConfig into normalized ic_* columns + per-table select_options rows.
 */
import type { Transaction } from 'sequelize'
import {
  AdminMetadataSelectOption,
  AdminPrimitiveMetadataSelectOption,
  AdminRelationshipMetadataSelectOption,
} from '../config/app.js'
import { encodeInputConfig, icColumnsToModelUpdate } from './adminMetadataInputConfigCodec.js'

export function splitInputConfigForPersistence(inputConfig: unknown): {
  icFields: Record<string, unknown>
  options: { displayOrder: number; label: string; valuePayload: string | null }[]
} {
  const raw =
    inputConfig !== null && inputConfig !== undefined && typeof inputConfig === 'object'
      ? (inputConfig as Record<string, unknown>)
      : null
  const { columns, options } = encodeInputConfig(raw)
  return { icFields: icColumnsToModelUpdate(columns), options }
}

export async function replaceSelectOptionsForMetadata(
  adminMetadataId: string,
  options: { displayOrder: number; label: string; valuePayload: string | null }[],
  transaction: Transaction
): Promise<void> {
  await AdminMetadataSelectOption.destroy({
    where: { adminMetadataId },
    transaction,
  })
  if (options.length === 0) {
    return
  }
  await AdminMetadataSelectOption.bulkCreate(
    options.map((o) => ({
      adminMetadataId,
      displayOrder: o.displayOrder,
      label: o.label,
      valuePayload: o.valuePayload,
    })),
    { transaction }
  )
}

export async function replaceSelectOptionsForPrimitiveMetadata(
  primitiveMetadataId: string,
  options: { displayOrder: number; label: string; valuePayload: string | null }[],
  transaction: Transaction
): Promise<void> {
  await AdminPrimitiveMetadataSelectOption.destroy({
    where: { primitiveMetadataId },
    transaction,
  })
  if (options.length === 0) {
    return
  }
  await AdminPrimitiveMetadataSelectOption.bulkCreate(
    options.map((o) => ({
      primitiveMetadataId,
      displayOrder: o.displayOrder,
      label: o.label,
      valuePayload: o.valuePayload,
    })),
    { transaction }
  )
}

export async function replaceSelectOptionsForRelationshipMetadata(
  relationshipMetadataId: string,
  options: { displayOrder: number; label: string; valuePayload: string | null }[],
  transaction: Transaction
): Promise<void> {
  await AdminRelationshipMetadataSelectOption.destroy({
    where: { relationshipMetadataId },
    transaction,
  })
  if (options.length === 0) {
    return
  }
  await AdminRelationshipMetadataSelectOption.bulkCreate(
    options.map((o) => ({
      relationshipMetadataId,
      displayOrder: o.displayOrder,
      label: o.label,
      valuePayload: o.valuePayload,
    })),
    { transaction }
  )
}
