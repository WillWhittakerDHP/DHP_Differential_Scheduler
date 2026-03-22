/**
 * Pure helpers for resolving select config type, multiple mode, and option entity key.
 * WHY: Reduces nesting and branch count in useSelectConfig composable; logic is testable.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import { RelationshipSelectModeEnum } from '@/types/entity/formDataEnums'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import type { SelectConfigLike, OptionsSelectConfigLike } from '@/types/admin/selectTypeResolver'
import { unwrapLegacyRelationshipSelect } from '@shared/utils/selectInputConfigCodec'

export type { SelectConfigLike, OptionsSelectConfigLike } from '@/types/admin/selectTypeResolver'

/**
 * Unwrap legacy inputConfig wrapped in relationshipSelect key; return as-is if already direct.
 */
export function unwrapInputConfig(
  inputConfig: Record<string, unknown>,
  _entityKey: string,
  _fieldKey: string
): Record<string, unknown> {
  return unwrapLegacyRelationshipSelect(inputConfig)
}

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
    if (targetMode === 'primitive') {
      return inputConfig as VirtualFieldType<GlobalEntityKey>
    }
  }
  throw new Error(
    `[selectTypeResolver] Invalid inputConfig format for ${entityKey}.${fieldKey}. ` +
      `Expected direct select config with targetMode ('relationship' or 'primitive').`
  )
}

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

export function resolveOptionEntityKey(
  isEnumSelect: boolean,
  isOptionsSelect: boolean,
  selectConfig: SelectConfigLike | undefined,
  entityKey: string,
  fieldKey: string
): GlobalEntityKey {
  if (isEnumSelect || isOptionsSelect) return 'blockShape' as GlobalEntityKey
  if (!selectConfig) return 'blockShape' as GlobalEntityKey
  if (selectConfig.targetMode === 'primitive') {
    if (!selectConfig.targetKey) {
      throw new Error(
        `[selectTypeResolver] Missing targetKey in inputConfig for ${entityKey}.${fieldKey}. ` +
          `Type select fields (targetMode: primitive) must have targetKey configured.`
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
