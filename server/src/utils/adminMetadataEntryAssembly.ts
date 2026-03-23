/**
 * Load select-option rows for admin_metadata IDs and assemble API metadata entry fields.
 */
import type { Transaction } from 'sequelize'
import { Op } from 'sequelize'
import { AdminMetadataSelectOption } from '../config/app.js'
import type { AdminMetadata } from '../db/models/admin/adminMetadata.js'
import { FIELD_NAMES } from '../routes/internal/entities/entityConstants.js'
import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes'
import {
  decodeInputConfig,
  icColumnsFromModel,
} from './adminMetadataInputConfigCodec.js'
import { nilToEmptyArray } from '@shared/utils/nilDefaults.js'
import type { AdminSelectOptionRow } from '@shared/types/adminSelectOptionRow.js'

export type SelectOptionRow = AdminSelectOptionRow

export interface FieldMetadataEntryAssembly extends MetadataEntryBase {
  panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS | 'events'
}

export async function fetchSelectOptionsByMetadataIds(
  metadataIds: string[]
): Promise<Map<string, SelectOptionRow[]>> {
  const map = new Map<string, SelectOptionRow[]>()
  if (metadataIds.length === 0) {
    return map
  }
  const rows = await AdminMetadataSelectOption.findAll({
    where: { adminMetadataId: { [Op.in]: metadataIds } },
    order: [
      ['adminMetadataId', 'ASC'],
      ['displayOrder', 'ASC'],
    ],
  })
  for (const r of rows) {
    const id = r.adminMetadataId
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

export function adminMetadataToApiEntry(
  meta: AdminMetadata,
  optionRows: SelectOptionRow[]
): Omit<FieldMetadataEntryAssembly, 'fieldKey'> {
  const inputConfig = decodeInputConfig(icColumnsFromModel(meta), optionRows)
  return {
    dataType: meta.dataType,
    label: meta.label,
    isRequired: meta.isRequired,
    visibility: meta.visibility,
    layout: meta.layout,
    displayOrder: meta.displayOrder,
    renderAs: meta.renderAs,
    statusButtonColor: meta.statusButtonColor ?? null,
    panel: meta.panel,
    bulkEdit: meta.bulkEdit,
    inputConfig,
  }
}

export async function buildMetadataRecordFromRows(
  metadata: AdminMetadata[]
): Promise<Record<string, Omit<FieldMetadataEntryAssembly, 'fieldKey'>>> {
  const optionsMap = await fetchSelectOptionsByMetadataIds(metadata.map((m) => m.id))
  const metadataRecord: Record<string, Omit<FieldMetadataEntryAssembly, 'fieldKey'>> = {}
  for (const meta of metadata) {
    const opts = nilToEmptyArray(optionsMap.get(meta.id))
    metadataRecord[meta.fieldKey] = adminMetadataToApiEntry(meta, opts)
  }
  return metadataRecord
}

/** HTTP response body for a single admin_metadata row (no ic_* keys; includes composed inputConfig). */
export async function adminMetadataToHttpPayload(
  meta: AdminMetadata,
  transaction?: Transaction
): Promise<Record<string, unknown>> {
  const rows = await AdminMetadataSelectOption.findAll({
    where: { adminMetadataId: meta.id },
    order: [['displayOrder', 'ASC']],
    transaction,
  })
  const optionRows: SelectOptionRow[] = rows.map((r) => ({
    displayOrder: r.displayOrder,
    label: r.label,
    valuePayload: r.valuePayload ?? null,
  }))
  const entry = adminMetadataToApiEntry(meta, optionRows)
  const plain = meta.get({ plain: true }) as Record<string, unknown>
  const cleaned = Object.fromEntries(
    Object.entries(plain).filter(([k]) => !k.startsWith('ic') && k !== 'selectOptions')
  )
  return { ...cleaned, ...entry }
}
