/**
 * Plans primitive PATCH payloads for status / boolean field toggles.
 * WHY: Shared pure logic for useStatusButtonToggle and related UI; keeps composables shallow.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import type { TernaryBoolean } from '@/types/ternary'
import type { ValidAdminValue } from '@/constants/primitives'

export type StatusToggleMutationPayload = {
  admin: { key: string; value: ValidAdminValue }
  dynamicId: string
}

export function isTernaryStringValue(raw: unknown): raw is TernaryBoolean {
  return raw === 'true' || raw === 'false' || raw === 'override'
}

function cycleTernaryBooleanCore(current: TernaryBoolean): TernaryBoolean {
  if (current === 'false') {
    return 'true'
  }
  if (current === 'true') {
    return 'override'
  }
  return 'false'
}

export function cycleTernaryBoolean(current: TernaryBoolean): TernaryBoolean {
  return cycleTernaryBooleanCore(current)
}

function isBooleanLikeAdminValueCore(raw: unknown): boolean {
  const normalized = raw === '' ? false : raw
  return (
    normalized === true ||
    normalized === false ||
    normalized === null ||
    normalized === undefined
  )
}

export function isBooleanLikeAdminValue(raw: unknown): boolean {
  return isBooleanLikeAdminValueCore(raw)
}

export function buildTernaryTogglePayloads(
  entityId: string,
  fieldKey: string,
  current: TernaryBoolean
): StatusToggleMutationPayload[] {
  return [
    {
      admin: { key: fieldKey, value: cycleTernaryBooleanCore(current) },
      dynamicId: entityId,
    },
  ]
}

export function buildBooleanTogglePayloads<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: GlobalEntity<GE>,
  fieldKey: GlobalFieldKey<GE>,
  currentRaw: unknown
): StatusToggleMutationPayload[] | null {
  const normalizedRaw = currentRaw === '' ? false : currentRaw
  if (!isBooleanLikeAdminValueCore(normalizedRaw)) {
    return null
  }

  const currentValue = normalizedRaw === true
  const newValue = !currentValue
  const payloads: StatusToggleMutationPayload[] = [
    {
      admin: { key: String(fieldKey), value: newValue },
      dynamicId: entity.id,
    },
  ]

  if (entityKey === 'blockShape' && newValue === true) {
    const shapeEntity = entity as GlobalEntity<'blockShape'>
    if (fieldKey === 'isStateControl') {
      const currentCanHaveParts = 'canHaveParts' in shapeEntity && shapeEntity.canHaveParts === true
      if (currentCanHaveParts) {
        payloads.push({
          admin: { key: 'canHaveParts', value: false },
          dynamicId: shapeEntity.id,
        })
      }
    } else if (fieldKey === 'canHaveParts') {
      const currentIsStateControl = 'isStateControl' in shapeEntity && shapeEntity.isStateControl === true
      if (currentIsStateControl) {
        payloads.push({
          admin: { key: 'isStateControl', value: false },
          dynamicId: shapeEntity.id,
        })
      }
    }
  }

  return payloads
}
