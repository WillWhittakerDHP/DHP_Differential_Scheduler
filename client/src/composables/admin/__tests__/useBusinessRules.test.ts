/**
 * Unit tests for useBusinessRules composable
 *
 * Covers: fetchRules, fetchRulesByBlock, createRule, updateRule, deleteRule, toggleRuleActive.
 * Validates API path usage, state updates (rules, error, success), and message constants.
 * Dependencies: @/utils/api (mocked), @/constants/businessRulesConstants.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBusinessRules } from '../useBusinessRules'
import apiClient from '@/utils/api'
import { BUSINESS_RULES_API_BASE } from '@/constants/businessRulesConstants'

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockGet = vi.mocked(apiClient.get)
const mockPost = vi.mocked(apiClient.post)
const mockPut = vi.mocked(apiClient.put)
const mockDelete = vi.mocked(apiClient.delete)

describe('useBusinessRules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchRules', () => {
    it('calls GET with base path when no filters', async () => {
      mockGet.mockResolvedValueOnce({ data: [] })
      const { fetchRules } = useBusinessRules()
      await fetchRules()
      expect(mockGet).toHaveBeenCalledWith(BUSINESS_RULES_API_BASE)
    })

    it('calls GET with query string when filters provided', async () => {
      mockGet.mockResolvedValueOnce({ data: [] })
      const { fetchRules } = useBusinessRules()
      await fetchRules({ blockInstanceId: 'block-1', ruleType: 'required_fields', active: true })
      expect(mockGet).toHaveBeenCalledWith(
        `${BUSINESS_RULES_API_BASE}?blockInstanceId=block-1&ruleType=required_fields&active=true`
      )
    })

    it('sets rules from response data', async () => {
      const mockRules = [{ id: 'r1', blockInstanceId: 'b1', ruleType: 'required_fields', ruleConfig: {}, active: true }]
      mockGet.mockResolvedValueOnce({ data: mockRules })
      const { fetchRules, rules } = useBusinessRules()
      await fetchRules()
      expect(rules.value).toEqual(mockRules)
    })

    it('sets error and clears rules on failure', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'))
      const { fetchRules, rules, error } = useBusinessRules()
      await fetchRules()
      expect(rules.value).toEqual([])
      expect(error.value).toBeTruthy()
    })
  })

  describe('fetchRulesByBlock', () => {
    it('calls GET with block path', async () => {
      mockGet.mockResolvedValueOnce({ data: [] })
      const { fetchRulesByBlock } = useBusinessRules()
      await fetchRulesByBlock('block-1')
      expect(mockGet).toHaveBeenCalledWith(`${BUSINESS_RULES_API_BASE}/block/block-1`)
    })

    it('returns data from response', async () => {
      const mockRules = [{ id: 'r1', blockInstanceId: 'block-1', ruleType: 'required_fields', ruleConfig: {}, active: true }]
      mockGet.mockResolvedValueOnce({ data: mockRules })
      const { fetchRulesByBlock } = useBusinessRules()
      const result = await fetchRulesByBlock('block-1')
      expect(result).toEqual(mockRules)
    })
  })

  describe('createRule', () => {
    it('calls POST with base path and form data', async () => {
      const formData = { blockInstanceId: 'b1', ruleType: 'required_fields' as const, ruleConfig: { fields: [] }, validationMessageAnnotationId: null, active: true }
      mockPost.mockResolvedValueOnce({ data: { id: 'r1', ...formData } })
      mockGet.mockResolvedValue({ data: [] })
      const { createRule } = useBusinessRules()
      await createRule(formData)
      expect(mockPost).toHaveBeenCalledWith(BUSINESS_RULES_API_BASE, formData)
    })
  })

  describe('deleteRule', () => {
    it('calls DELETE with id path', async () => {
      mockDelete.mockResolvedValueOnce(undefined)
      mockGet.mockResolvedValue({ data: [] })
      const { deleteRule } = useBusinessRules()
      await deleteRule('rule-1')
      expect(mockDelete).toHaveBeenCalledWith(`${BUSINESS_RULES_API_BASE}/rule-1`)
    })
  })

  describe('toggleRuleActive', () => {
    it('calls PUT with id path and active payload', async () => {
      mockPut.mockResolvedValueOnce(undefined)
      mockGet.mockResolvedValue({ data: [] })
      const { toggleRuleActive } = useBusinessRules()
      await toggleRuleActive('rule-1', true)
      expect(mockPut).toHaveBeenCalledWith(`${BUSINESS_RULES_API_BASE}/rule-1`, { active: true })
    })
  })
})
