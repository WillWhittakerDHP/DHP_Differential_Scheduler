/**
 * Compose inputConfig for legacy split tables (primitive / relationship metadata) from ic_* + option rows.
 */
import type { Transaction } from 'sequelize'
import { Op } from 'sequelize'
import {
  AdminPrimitiveMetadataSelectOption,
  AdminRelationshipMetadataSelectOption,
} from '../config/app.js'
import type { AdminPrimitiveMetadata } from '../db/models/admin/adminPrimitiveMetadata.js'
import type { AdminRelationshipMetadata } from '../db/models/admin/adminRelationshipMetadata.js'
import { mapMetaFieldsToPayload } from './adminMetadataPayload.js'
import { decodeInputConfig, icColumnsFromModel } from './adminMetadataInputConfigCodec.js'
import type { SelectOptionRow } from './adminMetadataEntryAssembly.js'

export async function fetchPrimitiveSelectOptionsByMetadataIds(
  metadataIds: string[]
): Promise<Map<string, SelectOptionRow[]>> {
  const map = new Map<string, SelectOptionRow[]>()
  if (metadataIds.length === 0) {
    return map
  }
  const rows = await AdminPrimitiveMetadataSelectOption.findAll({
    where: { primitiveMetadataId: { [Op.in]: metadataIds } },
    order: [
      ['primitiveMetadataId', 'ASC'],
      ['displayOrder', 'ASC'],
    ],
  })
  for (const r of rows) {
    const id = r.primitiveMetadataId
    if (!map.has(id)) {
      map.set(id, [])
    }
    map.get(id)!.push({
      displayOrder: r.displayOrder,
      label: r.label,
      valuePayload: r.valuePayload ?? null,
    })
  }
  return map
}

export async function fetchRelationshipSelectOptionsByMetadataIds(
  metadataIds: string[]
): Promise<Map<string, SelectOptionRow[]>> {
  const map = new Map<string, SelectOptionRow[]>()
  if (metadataIds.length === 0) {
    return map
  }
  const rows = await AdminRelationshipMetadataSelectOption.findAll({
    where: { relationshipMetadataId: { [Op.in]: metadataIds } },
    order: [
      ['relationshipMetadataId', 'ASC'],
      ['displayOrder', 'ASC'],
    ],
  })
  for (const r of rows) {
    const id = r.relationshipMetadataId
    if (!map.has(id)) {
      map.set(id, [])
    }
    map.get(id)!.push({
      displayOrder: r.displayOrder,
      label: r.label,
      valuePayload: r.valuePayload ?? null,
    })
  }
  return map
}

function stripIcFromPlain(plain: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(plain).filter(([k]) => !k.startsWith('ic') && k !== 'selectOptions')
  )
}

export async function primitiveMetadataToHttpPayload(
  meta: AdminPrimitiveMetadata,
  transaction?: Transaction
): Promise<Record<string, unknown>> {
  const rows = await AdminPrimitiveMetadataSelectOption.findAll({
    // @audit-allow:hardcoding:fieldMapping - Sequelize where clause; FK column primitiveMetadataId
    where: { primitiveMetadataId: meta.id },
    order: [['displayOrder', 'ASC']],
    transaction,
  })
  const optionRows: SelectOptionRow[] = rows.map((r) => ({
    displayOrder: r.displayOrder,
    label: r.label,
    valuePayload: r.valuePayload ?? null,
  }))
  const inputConfig = decodeInputConfig(icColumnsFromModel(meta), optionRows)
  const payload = mapMetaFieldsToPayload({
    dataType: meta.dataType,
    label: meta.label,
    isRequired: meta.isRequired,
    visibility: meta.visibility,
    layout: meta.layout,
    displayOrder: meta.displayOrder,
    renderAs: meta.renderAs,
    statusButtonColor: meta.statusButtonColor,
    panel: meta.panel,
    bulkEdit: meta.bulkEdit,
    inputConfig,
  })
  const plain = meta.get({ plain: true }) as Record<string, unknown>
  const cleaned = stripIcFromPlain(plain)
  return { ...cleaned, ...payload }
}

export async function relationshipMetadataToHttpPayload(
  meta: AdminRelationshipMetadata,
  transaction?: Transaction
): Promise<Record<string, unknown>> {
  const rows = await AdminRelationshipMetadataSelectOption.findAll({
    // @audit-allow:hardcoding:fieldMapping - Sequelize where clause; FK column relationshipMetadataId
    where: { relationshipMetadataId: meta.id },
    order: [['displayOrder', 'ASC']],
    transaction,
  })
  const optionRows: SelectOptionRow[] = rows.map((r) => ({
    displayOrder: r.displayOrder,
    label: r.label,
    valuePayload: r.valuePayload ?? null,
  }))
  const inputConfig = decodeInputConfig(icColumnsFromModel(meta), optionRows)
  const payload = mapMetaFieldsToPayload({
    dataType: meta.dataType,
    label: meta.label,
    isRequired: meta.isRequired,
    visibility: meta.visibility,
    layout: meta.layout,
    displayOrder: meta.displayOrder,
    renderAs: meta.renderAs,
    statusButtonColor: meta.statusButtonColor,
    panel: meta.panel,
    bulkEdit: meta.bulkEdit,
    inputConfig,
  })
  const plain = meta.get({ plain: true }) as Record<string, unknown>
  const cleaned = stripIcFromPlain(plain)
  return { ...cleaned, ...payload }
}
