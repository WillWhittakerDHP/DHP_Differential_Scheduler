/**
 * Typed InjectionKey constants for admin provide/inject.
 * PATTERN: Use these keys in provide() and inject() for type-safe dependency injection.
 * PLACEMENT: types/admin (not composables/) — keys-only module; naming audit expects use*.ts under composables/.
 */
import type { InjectionKey } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { BusinessRule, BusinessRuleFormData, RuleType } from '@/types/admin/businessRules'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

/** Context provided by BusinessRulesTab and consumed by RuleFormDialog (replaces prop-drilling). */
export interface RuleFormDialogContext {
  showRuleDialog: Ref<boolean | undefined>
  formData: Ref<BusinessRuleFormData>
  editingRule: Ref<BusinessRule | null>
  ruleTypeOptions: readonly { title: string; value: RuleType }[]
  availableBlockInstances: ComputedRef<{ id: string; title: string; value: string }[]>
  availableValidationMessages: ComputedRef<{ id: string; title: string; value: string }[]>
  requiredFieldsArray: ComputedRef<string>
  requiredFieldsCondition: ComputedRef<string>
  requiresAgent: ComputedRef<boolean | undefined>
  saving: Ref<boolean>
  updateFormField: <F extends keyof BusinessRuleFormData>(field: F, value: BusinessRuleFormData[F]) => void
  setRequiredFieldsArray: (v: string) => void
  setRequiredFieldsCondition: (v: string) => void
  setRequiresAgent: (v: boolean) => void
  saveRule: () => Promise<void>
  closeDialog: () => void
}

export const ruleFormDialogContextKey: InjectionKey<RuleFormDialogContext> =
  Symbol('ruleFormDialogContext')

/** Context provided by InstancesTab and consumed by BlockInstancesGroup. */
export interface InstancesTabContext {
  blockShapeComposable: ComputedRef<Map<string, boolean>>
  blockShapeStateControl: ComputedRef<Map<string, boolean>>
  blockShapeValidBookingCascades: ComputedRef<Map<string, string[]>>
  bulkEditMode: Ref<Map<string, boolean>>
  toggleBulkEditMode: (blockShapeId: string) => void
  handleCreateClick: (blockShapeId: string) => void
  groupContainers: Ref<Map<string, HTMLElement | null>>
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  expandedInstances: Ref<string[]>
  isPanelExpanded: (id: string) => boolean
  groupPanelsContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupPanelsGroupedContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  handleExistingBlockInstanceSaved: (entity: GlobalEntity<GlobalEntityKey>) => void
  handleDeleteBlockInstance: (id: string) => void
  handleDuplicateClick: (entity: GlobalEntity<GlobalEntityKey>) => void
  shapeCascadeColor: (blockShape: { id: string }) => 'info' | 'default'
}

export const instancesTabContextKey: InjectionKey<InstancesTabContext> =
  Symbol('instancesTabContext')

/** Admin shell active tab id; provider: AdminPanel.vue. */
export const adminCurrentTabKey: InjectionKey<Ref<string>> = Symbol('adminCurrentTab')
