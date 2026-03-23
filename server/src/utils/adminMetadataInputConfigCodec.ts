/**
 * Maps metadata input configuration between API shape (inputConfig object) and normalized ic_* columns.
 */

import {
  assertSelectInputConfigNotPropertyTargetMode,
  unwrapLegacyRelationshipSelect,
} from '@shared/utils/selectInputConfigCodec.js'
import { nilToEmptyString } from '@shared/utils/nilDefaults.js'
import { createLogger } from './logger.js'
import type { AdminSelectOptionRow } from '@shared/types/adminSelectOptionRow.js'

const logger = createLogger('adminMetadataInputConfigCodec')

interface AdminMetadataIcColumns {
  icTargetMode: string | null
  icSelectMode: string | null
  icSelectType: string | null
  icTargetKey: string | null
  icGlobalField: string | null
  icPlaceholder: string | null
  icGroupByKey: string | null
  icSelectedChildKey: string | null
  icCandidateChildKey: string | null
  icSelectedParentKey: string | null
  icCandidateParentKey: string | null
  icSelectedChildPath: string[] | null
  icCandidateChildPath: string[] | null
  icCandidateParentPath: string[] | null
}

type SelectOptionRowInput = AdminSelectOptionRow

function asStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const out = v.filter((x): x is string => typeof x === 'string')
  return out.length === v.length ? out : null
}

function strOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v
  return String(v)
}

/**
 * Encode API inputConfig into column payload + select options (options-only fields).
 */
export function encodeInputConfig(
  inputConfig: Record<string, unknown> | null | undefined
): { columns: AdminMetadataIcColumns; options: SelectOptionRowInput[] } {
  const empty: AdminMetadataIcColumns = {
    icTargetMode: null,
    icSelectMode: null,
    icSelectType: null,
    icTargetKey: null,
    icGlobalField: null,
    icPlaceholder: null,
    icGroupByKey: null,
    icSelectedChildKey: null,
    icCandidateChildKey: null,
    icSelectedParentKey: null,
    icCandidateParentKey: null,
    icSelectedChildPath: null,
    icCandidateChildPath: null,
    icCandidateParentPath: null,
  }

  if (!inputConfig || typeof inputConfig !== 'object') {
    return { columns: empty, options: [] }
  }

  assertSelectInputConfigNotPropertyTargetMode(inputConfig)

  const rawOpts = inputConfig.options
  if (Array.isArray(rawOpts)) {
    const options: SelectOptionRowInput[] = rawOpts
      .filter((o): o is Record<string, unknown> => typeof o === 'object' && o !== null)
      .map((o, index) => {
        const label = nilToEmptyString(strOrNull(o.label))
        const val = o.value
        const valuePayload = val === undefined ? null : JSON.stringify(val)
        return { displayOrder: index, label, valuePayload }
      })
    return { columns: empty, options }
  }

  const cfg = unwrapLegacyRelationshipSelect(inputConfig as Record<string, unknown>)
  return {
    columns: {
      icTargetMode: strOrNull(cfg.targetMode),
      icSelectMode: strOrNull(cfg.selectMode),
      icSelectType: strOrNull(cfg.selectType),
      icTargetKey: strOrNull(cfg.targetKey),
      icGlobalField: strOrNull(cfg.globalField),
      icPlaceholder: strOrNull(cfg.placeholder),
      icGroupByKey: cfg.groupByKey === null || cfg.groupByKey === undefined ? null : strOrNull(cfg.groupByKey),
      icSelectedChildKey: strOrNull(cfg.selectedChildKey),
      icCandidateChildKey: strOrNull(cfg.candidateChildKey),
      icSelectedParentKey: strOrNull(cfg.selectedParentKey),
      icCandidateParentKey: strOrNull(cfg.candidateParentKey),
      icSelectedChildPath: asStringArray(cfg.selectedChildPath),
      icCandidateChildPath: asStringArray(cfg.candidateChildPath),
      icCandidateParentPath: asStringArray(cfg.candidateParentPath),
    },
    options: [],
  }
}

/**
 * Build API inputConfig from normalized columns + option rows (ordered by display_order).
 */
export function decodeInputConfig(
  row: AdminMetadataIcColumns,
  optionRows: ReadonlyArray<{ displayOrder: number; label: string; valuePayload: string | null }>
): Record<string, unknown> | null {
  if (optionRows.length > 0) {
    const options = optionRows.map((r) => {
      let value: unknown = null
      if (r.valuePayload !== null && r.valuePayload !== undefined && r.valuePayload !== '') {
        try {
          const parsed: unknown = JSON.parse(r.valuePayload)
          value = parsed
        } catch (parseErr: unknown) {
          logger.warn('inputConfig option valuePayload is not valid JSON; using raw string', {
            displayOrder: r.displayOrder,
            label: r.label,
            parseErr,
          })
          value = r.valuePayload
        }
      }
      return { label: r.label, value }
    })
    return { options }
  }

  const hasRelationship =
    row.icTargetMode !== null ||
    row.icSelectMode !== null ||
    row.icSelectType !== null ||
    row.icTargetKey !== null

  if (!hasRelationship) {
    return null
  }

  const out: Record<string, unknown> = {}
  if (row.icTargetMode !== null) out.targetMode = row.icTargetMode
  if (row.icSelectMode !== null) out.selectMode = row.icSelectMode
  if (row.icSelectType !== null) out.selectType = row.icSelectType
  if (row.icTargetKey !== null) out.targetKey = row.icTargetKey
  if (row.icGlobalField !== null) out.globalField = row.icGlobalField
  if (row.icPlaceholder !== null) out.placeholder = row.icPlaceholder
  if (row.icTargetMode === 'relationship') {
    out.groupByKey = row.icGroupByKey
  } else if (row.icGroupByKey !== null) {
    out.groupByKey = row.icGroupByKey
  }
  if (row.icSelectedChildKey !== null) out.selectedChildKey = row.icSelectedChildKey
  if (row.icCandidateChildKey !== null) out.candidateChildKey = row.icCandidateChildKey
  if (row.icSelectedParentKey !== null) out.selectedParentKey = row.icSelectedParentKey
  if (row.icCandidateParentKey !== null) out.candidateParentKey = row.icCandidateParentKey
  if (row.icSelectedChildPath !== null && row.icSelectedChildPath.length > 0) {
    out.selectedChildPath = row.icSelectedChildPath
  }
  if (row.icCandidateChildPath !== null && row.icCandidateChildPath.length > 0) {
    out.candidateChildPath = row.icCandidateChildPath
  }
  if (row.icCandidateParentPath !== null && row.icCandidateParentPath.length > 0) {
    out.candidateParentPath = row.icCandidateParentPath
  }
  return out
}

/** Sequelize row -> ic column bag (camelCase attribute names). */
export function icColumnsFromModel(m: {
  icTargetMode?: string | null
  icSelectMode?: string | null
  icSelectType?: string | null
  icTargetKey?: string | null
  icGlobalField?: string | null
  icPlaceholder?: string | null
  icGroupByKey?: string | null
  icSelectedChildKey?: string | null
  icCandidateChildKey?: string | null
  icSelectedParentKey?: string | null
  icCandidateParentKey?: string | null
  icSelectedChildPath?: string[] | null
  icCandidateChildPath?: string[] | null
  icCandidateParentPath?: string[] | null
}): AdminMetadataIcColumns {
  return {
    icTargetMode: m.icTargetMode ?? null,
    icSelectMode: m.icSelectMode ?? null,
    icSelectType: m.icSelectType ?? null,
    icTargetKey: m.icTargetKey ?? null,
    icGlobalField: m.icGlobalField ?? null,
    icPlaceholder: m.icPlaceholder ?? null,
    icGroupByKey: m.icGroupByKey ?? null,
    icSelectedChildKey: m.icSelectedChildKey ?? null,
    icCandidateChildKey: m.icCandidateChildKey ?? null,
    icSelectedParentKey: m.icSelectedParentKey ?? null,
    icCandidateParentKey: m.icCandidateParentKey ?? null,
    icSelectedChildPath: m.icSelectedChildPath ?? null,
    icCandidateChildPath: m.icCandidateChildPath ?? null,
    icCandidateParentPath: m.icCandidateParentPath ?? null,
  }
}

export function icColumnsToModelUpdate(columns: AdminMetadataIcColumns): Record<string, unknown> {
  return {
    icTargetMode: columns.icTargetMode,
    icSelectMode: columns.icSelectMode,
    icSelectType: columns.icSelectType,
    icTargetKey: columns.icTargetKey,
    icGlobalField: columns.icGlobalField,
    icPlaceholder: columns.icPlaceholder,
    icGroupByKey: columns.icGroupByKey,
    icSelectedChildKey: columns.icSelectedChildKey,
    icCandidateChildKey: columns.icCandidateChildKey,
    icSelectedParentKey: columns.icSelectedParentKey,
    icCandidateParentKey: columns.icCandidateParentKey,
    icSelectedChildPath: columns.icSelectedChildPath,
    icCandidateChildPath: columns.icCandidateChildPath,
    icCandidateParentPath: columns.icCandidateParentPath,
  }
}
