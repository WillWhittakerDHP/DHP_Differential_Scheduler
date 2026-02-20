/**
 * Pure helpers for resolving select config type, multiple mode, and option entity key.
 * WHY: Reduces nesting and branch count in useSelectConfig composable; logic is testable.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import { RelationshipSelectModeEnum } from '@/types/entity/formDataEnums'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'

export type SelectConfigLike =
  | RelationshipFieldType<GlobalEntityKey>
  | VirtualFieldType<GlobalEntityKey>

export interface OptionsSelectConfigLike {
  options: Array<{ value: string | null; label: string }>
  selectMode?: RelationshipSelectModeEnum
}

/**
 * Unwrap legacy inputConfig wrapped in relationshipSelect key; return as-is if already direct.
 */
export function unwrapInputConfig(
  inputConfig: Record<string, unknown>,
  _entityKey: string,
  _fieldKey: string
): Record<string, unknown> {
  if ('targetMode' in inputConfig) return inputConfig
  if (!('relationshipSelect' in inputConfig)) return inputConfig
  const wrapped = inputConfig.relationshipSelect
  if (typeof wrapped === 'object' && wrapped !== null && 'targetMode' in wrapped) {
    return wrapped as Record<string, unknown>
  }
  return inputConfig
}

/**
 * Return relationship or property select config from unwrapped inputConfig; throws if invalid.
 */
export function getSelectConfigFromUnwrapped(
  inputConfig: Record<string, unknown>,
  entityKey: string,
  fieldKey: string
): SelectConfigLike {
  if ('targetMode' in inputConfig) {
    const targetMode = inputConfig.targetMode as string
    if (targetMode === 'relationship') {
      return inputConfig as RelationshipFieldType<GlobalEntityKey>
    }
    if (targetMode === 'property') {
      return inputConfig as VirtualFieldType<GlobalEntityKey>
    }
  }
  throw new Error(
    `[selectTypeResolver] Invalid inputConfig format for ${entityKey}.${fieldKey}. ` +
      `Expected direct select config with targetMode ('relationship' or 'property').`
  )
}

/**
 * Resolve whether select is multiple from config; throws if selectMode missing when config exists.
 */
export function resolveSelectMultiple(
  isEnumSelect: boolean,
  optionsConfig: OptionsSelectConfigLike | undefined,
  selectConfig: SelectConfigLike | undefined,
  entityKey: string,
  fieldKey: string
): boolean {
  if (isEnumSelect) return false
  if (optionsConfig) {
    return optionsConfig.selectMode === RelationshipSelectModeEnum.Multiple
  }
  if (!selectConfig) return false
  if (!selectConfig.selectMode) {
    throw new Error(
      `[selectTypeResolver] Missing selectMode in inputConfig for ${entityKey}.${fieldKey}. ` +
        `Select fields must have selectMode configured in inputConfig.`
    )
  }
  return selectConfig.selectMode === RelationshipSelectModeEnum.Multiple
}

/**
 * Resolve option entity key from config; throws if required keys missing.
 */
export function resolveOptionEntityKey(
  isEnumSelect: boolean,
  isOptionsSelect: boolean,
  selectConfig: SelectConfigLike | undefined,
  entityKey: string,
  fieldKey: string
): GlobalEntityKey {
  if (isEnumSelect || isOptionsSelect) return 'blockShape' as GlobalEntityKey
  if (!selectConfig) return 'blockShape' as GlobalEntityKey
  if (selectConfig.targetMode === 'property') {
    if (!selectConfig.targetKey) {
      throw new Error(
        `[selectTypeResolver] Missing targetKey in inputConfig for ${entityKey}.${fieldKey}. ` +
          `Type select fields (targetMode: property) must have targetKey configured.`
      )
    }
    return selectConfig.targetKey
  }
  if (!selectConfig.candidateChildKey) {
    throw new Error(
      `[selectTypeResolver] Missing candidateChildKey in inputConfig for ${entityKey}.${fieldKey}. ` +
        `Relationship select fields (targetMode: relationship) must have candidateChildKey configured.`
    )
  }
  return selectConfig.candidateChildKey as GlobalEntityKey
}
