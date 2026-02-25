/**
 * WHY: Tab logic for Business Rules admin tab; keeps BusinessRulesTab.vue thin (audit: component-logic).
 * PATTERN: Composes useBusinessRules, useBusinessRuleForm, useGlobal; exposes selection, filtered rules, and handlers.
 */
import { ref, computed, watch } from 'vue'
import { useBusinessRules, type BusinessRule } from '@/composables/admin/useBusinessRules'
import { useBusinessRuleForm } from '@/composables/admin/useBusinessRuleForm'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'

export type { BusinessRule } from '@/composables/admin/useBusinessRules'

export function useBusinessRulesTab() {
  const {
    rules,
    loading,
    saving,
    error,
    success,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRuleActive,
  } = useBusinessRules()

  const { getGlobalEntities } = useGlobal()
  const selectedBlockId = ref<GlobalEntityId | null>(null)

  const {
    formData,
    editingRule,
    showRuleDialog,
    ruleTypeOptions,
    requiredFieldsArray,
    requiredFieldsCondition,
    requiresAgent,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    formatRuleType,
    formatRuleConfig,
  } = useBusinessRuleForm(selectedBlockId)

  const availableBlockInstances = computed(() => {
    const blockInstances = getGlobalEntities('blockInstance')
    return blockInstances.map((bi) => ({
      id: bi.id,
      title: bi.name ?? `Block ${bi.id}`,
      value: bi.id,
    }))
  })

  const availableValidationMessages = computed(() => {
    const annotationInstances = getGlobalEntities('annotationInstance')
    return annotationInstances.map((ai) => ({
      id: ai.id,
      title: ai.name ?? `Annotation ${ai.id}`,
      value: ai.id,
    }))
  })

  watch(
    selectedBlockId,
    async (newBlockId) => {
      if (newBlockId) {
        await fetchRules({ blockInstanceId: newBlockId })
      } else {
        rules.value = []
      }
    },
    { immediate: true }
  )

  const filteredRules = computed(() => {
    if (!selectedBlockId.value) return []
    return rules.value.filter((rule) => rule.blockInstanceId === selectedBlockId.value)
  })

  const saveRule = async (): Promise<void> => {
    if (editingRule.value) {
      const result = await updateRule(editingRule.value.id, formData.value)
      if (result) closeDialog()
    } else {
      const result = await createRule(formData.value)
      if (result) closeDialog()
    }
  }

  const handleDeleteRule = async (rule: BusinessRule): Promise<void> => {
    const title = ruleTypeOptions.find((o) => o.value === rule.ruleType)?.title
    if (confirm(`Delete business rule for ${title ?? rule.ruleType}?`)) {
      await deleteRule(rule.id)
    }
  }

  const handleToggleActive = (rule: BusinessRule): void => {
    toggleRuleActive(rule.id, !rule.active)
  }

  const selectedBlockTitle = computed(() =>
    availableBlockInstances.value.find((b) => b.value === selectedBlockId.value)?.title
  )

  function setRequiredFieldsArray(v: string): void {
    requiredFieldsArray.value = v
  }
  function setRequiredFieldsCondition(v: string): void {
    requiredFieldsCondition.value = v
  }
  function setRequiresAgent(v: boolean): void {
    requiresAgent.value = v
  }

  return {
    rules,
    loading,
    saving,
    error,
    success,
    selectedBlockId,
    availableBlockInstances,
    availableValidationMessages,
    filteredRules,
    selectedBlockTitle,
    formData,
    editingRule,
    showRuleDialog,
    ruleTypeOptions,
    requiredFieldsArray,
    requiredFieldsCondition,
    requiresAgent,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    formatRuleType,
    formatRuleConfig,
    saveRule,
    handleDeleteRule,
    handleToggleActive,
    setRequiredFieldsArray,
    setRequiredFieldsCondition,
    setRequiresAgent,
  }
}
