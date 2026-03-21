import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { RuleConfig } from '@shared/types/businessRulesTypes'
import { RULE_TYPE_VALUES } from '@/constants/businessRulesConstants.js'

export type RuleType = (typeof RULE_TYPE_VALUES)[keyof typeof RULE_TYPE_VALUES]

export interface BusinessRuleCore {
  blockInstanceId: GlobalEntityId
  ruleType: RuleType
  ruleConfig: RuleConfig
  validationMessageAnnotationId: GlobalEntityId | null
  active: boolean
}

export interface BusinessRule extends BusinessRuleCore {
  id: GlobalEntityId
  createdAt: string
  updatedAt: string
}

export type BusinessRuleFormData = BusinessRuleCore
