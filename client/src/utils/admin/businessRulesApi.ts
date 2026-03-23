/**
 * WHY: Thin API layer for business rules; useBusinessRules keeps state and withAsyncOperation (audit: composables-logic).
 */
import apiClient from '@/utils/api'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { asEmptyArray } from '@/utils/safeDefaults'
import { BUSINESS_RULES_API_BASE } from '@/constants/businessRulesConstants.js'
import type { BusinessRule, BusinessRuleFormData, RuleType } from '@/types/admin/businessRules'

export type { BusinessRule, BusinessRuleFormData, RuleType }

interface BusinessRulesQueryFilters {
  blockInstanceId?: GlobalEntityId
  ruleType?: RuleType
  active?: boolean
}

function buildQueryString(filters?: BusinessRulesQueryFilters): string {
  if (!filters) return ''
  const entries: [string, string][] = []
  if (filters.blockInstanceId) entries.push(['blockInstanceId', filters.blockInstanceId])
  if (filters.ruleType) entries.push(['ruleType', filters.ruleType])
  if (filters.active !== undefined) entries.push(['active', String(filters.active)])
  if (entries.length === 0) return ''
  return new URLSearchParams(entries).toString()
}

export async function fetchBusinessRules(filters?: BusinessRulesQueryFilters): Promise<BusinessRule[]> {
  const queryString = buildQueryString(filters)
  const url = `${BUSINESS_RULES_API_BASE}${queryString ? `?${queryString}` : ''}`
  const response = await apiClient.get<BusinessRule[]>(url)
  return asEmptyArray(response.data)
}

export async function fetchBusinessRulesByBlock(blockInstanceId: GlobalEntityId): Promise<BusinessRule[]> {
  const response = await apiClient.get<BusinessRule[]>(`${BUSINESS_RULES_API_BASE}/block/${blockInstanceId}`)
  return asEmptyArray(response.data)
}

export async function createBusinessRule(formData: BusinessRuleFormData): Promise<BusinessRule | null> {
  const response = await apiClient.post<BusinessRule>(BUSINESS_RULES_API_BASE, formData)
  return response.data ?? null
}

export async function updateBusinessRule(id: GlobalEntityId, formData: BusinessRuleFormData): Promise<BusinessRule | null> {
  const response = await apiClient.put<BusinessRule>(`${BUSINESS_RULES_API_BASE}/${id}`, formData)
  return response.data ?? null
}

export async function deleteBusinessRule(id: GlobalEntityId): Promise<void> {
  await apiClient.delete(`${BUSINESS_RULES_API_BASE}/${id}`)
}

export async function toggleBusinessRuleActive(id: GlobalEntityId, active: boolean): Promise<void> {
  await apiClient.put(`${BUSINESS_RULES_API_BASE}/${id}`, { active })
}
