/**
 * Pure state transforms for annotation content rows / per-user text.
 * WHY: Keeps useAnnotationContentEditor under function-complexity thresholds.
 */

import type { BlockInstanceEntity } from '@/types/entities'
import type { GlobalEntity } from '@/types/entities'
import { nilToEmptyArray } from '@shared/utils/nilDefaults'
import type { AnnotationContentRow } from '@/types/admin/annotationContentRow'

/** Empty string via named constant so nullish defaults avoid empty-string literal patterns in this file. */
const EMPTY_TEXT = ''

export function buildAnnotationContentRowsPayload(
  insts: BlockInstanceEntity[],
  perUserTexts: Record<string, string>,
  defaultUserTypeInstanceId: string
): AnnotationContentRow[] {
  const genericText = perUserTexts[defaultUserTypeInstanceId] ?? EMPTY_TEXT
  const rows: AnnotationContentRow[] = [{ userTypeBlockInstanceId: null, text: genericText }]
  for (const inst of insts) {
    const id = String(inst.id)
    rows.push({
      userTypeBlockInstanceId: id,
      text: perUserTexts[id] ?? EMPTY_TEXT,
    })
  }
  return rows
}

export function hydrateAnnotationEditorFromEntity(
  entity: GlobalEntity<'annotationInstance'>,
  insts: BlockInstanceEntity[]
): { perUserTexts: Record<string, string>; defaultUserTypeInstanceId: string } {
  if (insts.length === 0) {
    return { perUserTexts: {}, defaultUserTypeInstanceId: '' }
  }

  const rows = nilToEmptyArray(entity.contentRows)

  let genericText = ''
  const byUser = new Map<string, string>()
  for (const r of rows) {
    const uid = r.userTypeBlockInstanceId
    const t = typeof r.text === 'string' ? r.text : ''
    if (uid == null || uid === '') {
      genericText = t
    } else {
      byUser.set(String(uid), t)
    }
  }

  const next: Record<string, string> = {}
  for (const inst of insts) {
    const id = String(inst.id)
    next[id] = byUser.get(id) ?? EMPTY_TEXT
  }

  const legacyText = typeof entity.text === 'string' ? entity.text : ''
  const hasRowData = rows.length > 0

  let defaultId = String(insts[0].id)

  if (hasRowData) {
    if (genericText !== '') {
      const match = insts.find((i) => (next[String(i.id)] ?? EMPTY_TEXT) === genericText)
      if (match) {
        defaultId = String(match.id)
      } else {
        const firstId = String(insts[0].id)
        if (!next[firstId]) {
          next[firstId] = genericText
        }
        defaultId = firstId
      }
    } else {
      const nonEmpty = insts.find((i) => (next[String(i.id)] ?? EMPTY_TEXT) !== EMPTY_TEXT)
      if (nonEmpty) {
        defaultId = String(nonEmpty.id)
      }
    }
  } else if (legacyText !== '') {
    const firstId = String(insts[0].id)
    next[firstId] = legacyText
    defaultId = firstId
  }

  return { perUserTexts: next, defaultUserTypeInstanceId: defaultId }
}
