import type { BusinessRule } from '@/types/admin/businessRules'
/**
 * WHY: Tab logic for Business Rules admin tab; keeps BusinessRulesTab.vue thin (audit: component-logic).
 * PATTERN: Composes useBusinessRules, useBusinessRuleForm, useGlobal; exposes selection, filtered rules, and handlers.
 */
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import { ref, computed, watch } from 'vue'
import { useBusinessRules } from '@/composables/admin/useBusinessRules'
import { useBusinessRuleForm } from '@/composables/admin/useBusinessRuleForm'
import type { BusinessRuleFormData, RuleType } from '@/types/admin/businessRules'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'

/** Grouped return for composable-health (oversized-return repair). */
export interface UseBusinessRulesTabReturn {
  data: {
    rules: Ref<BusinessRule[]>
    loading: Ref<boolean>
    saving: Ref<boolean>
    error: Ref<string | null>
    success: Ref<string | null>
    selectedBlockId: Ref<GlobalEntityId | null>
    availableBlockInstances: ComputedRef<{ id: string; title: string; value: string }[]>
    availableValidationMessages: ComputedRef<{ id: string; title: string; value: string }[]>
    filteredRules: ComputedRef<BusinessRule[]>
    selectedBlockTitle: ComputedRef<string | undefined>
  }
  form: {
    formData: Ref<BusinessRuleFormData>
    editingRule: Ref<BusinessRule | null>
    showRuleDialog: Ref<boolean | undefined>
    ruleTypeOptions: ReadonlyArray<{ title: string; value: RuleType; description?: string }>
    requiredFieldsArray: WritableComputedRef<string>
    requiredFieldsCondition: WritableComputedRef<string>
    requiresAgent: WritableComputedRef<boolean | undefined>
  }
  actions: {
    openCreateDialog: () => void
    openEditDialog: (rule: BusinessRule) => void
    closeDialog: () => void
    formatRuleType: (ruleType: RuleType) => string
    formatRuleConfig: (rule: BusinessRule) => string
    saveRule: () => Promise<void>
    handleDeleteRule: (rule: BusinessRule) => Promise<void>
    handleToggleActive: (rule: BusinessRule) => void
    setRequiredFieldsArray: (v: string) => void
    setRequiredFieldsCondition: (v: string) => void
    setRequiresAgent: (v: boolean) => void
  }
}

export function useBusinessRulesTab(): UseBusinessRulesTabReturn {
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
    data: {
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
    },
    form: {
      formData,
      editingRule,
      showRuleDialog,
      ruleTypeOptions,
      requiredFieldsArray,
      requiredFieldsCondition,
      requiresAgent,
    },
    actions: {
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
    },
  } as UseBusinessRulesTabReturn
}
