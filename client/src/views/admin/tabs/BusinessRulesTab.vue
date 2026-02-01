<!--
  LEARNING: Business Rules Tab Component
  WHY: Allows admin to configure validation rules per block instance (services, dwelling adjustments)
  PATTERN: Form with block selection, rules list, and add/edit dialog
  COMPARISON: Similar to BusinessControlsTab pattern with composable for logic
  RESOURCE: https://vuetifyjs.com/en/components/dialogs/
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBusinessRules, type BusinessRule, type BusinessRuleFormData, type RuleType } from '@/composables/admin/useBusinessRules'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntityId } from '@/types/entities'

/**
 * LEARNING: Use business rules composable for state and API methods
 * WHY: All logic moved to composable - component is pure rendering
 * PATTERN: Composable handles all state, API calls, and validation
 */
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
  toggleRuleActive
} = useBusinessRules()

/**
 * LEARNING: Use global composable to access block instances
 * WHY: Need to display available block instances for business rule configuration
 * PATTERN: Use useGlobal composable to access global entities
 */
const { getGlobalEntities } = useGlobal()

/**
 * LEARNING: Get available block instances for selection
 * WHY: Admin needs to select which service/dwelling adjustment to configure rules for
 * PATTERN: Filter block instances, map to select options
 */
const availableBlockInstances = computed(() => {
  const blockInstances = getGlobalEntities('blockInstance')
  
  return blockInstances.map(bi => ({
    id: bi.id,
    title: bi.name || `Block ${bi.id}`,
    value: bi.id,
    // Group by blockShape.name if available (optional enhancement)
  }))
})

/**
 * LEARNING: Get available annotation instances for validation messages
 * WHY: Admin links business rules to annotation instances for messages
 * PATTERN: Filter annotation instances by type "validation_message"
 */
const availableValidationMessages = computed(() => {
  const annotationInstances = getGlobalEntities('annotationInstance')
  
  // TODO: Filter by annotationShape.name === 'validation_message'
  // For now, show all annotation instances
  // LEARNING: name field contains the annotation text (transformed from API "text" field)
  return annotationInstances.map(ai => ({
    id: ai.id,
    title: ai.name || `Annotation ${ai.id}`,
    value: ai.id
  }))
})

// UI State
const selectedBlockId: Ref<GlobalEntityId | null> = ref(null)
const showRuleDialog = ref(false)
const editingRule: Ref<BusinessRule | null> = ref(null)

// Form Data
const formData: Ref<BusinessRuleFormData> = ref({
  blockInstanceId: '',
  ruleType: 'required_fields',
  ruleConfig: { fields: [] },
  validationMessageAnnotationId: null,
  active: true
})

// Rule Type Options
const ruleTypeOptions = [
  { title: 'Required Fields', value: 'required_fields', description: 'Additional required fields based on block selection' },
  { title: 'Requires Agent', value: 'requires_agent', description: 'Service requires agent/client contact information' },
  { title: 'Conditional Validation', value: 'conditional_validation', description: 'Field validation depends on other field values' },
  { title: 'Validation Message', value: 'validation_message', description: 'Custom validation messages for fields/blocks' }
]

/**
 * LEARNING: Watch selectedBlockId and fetch rules for that block
 * WHY: Auto-refresh rules list when block selection changes
 * PATTERN: Watch reactive ref, call fetchRules with filter
 */
watch(selectedBlockId, async (newBlockId) => {
  if (newBlockId) {
    await fetchRules({ blockInstanceId: newBlockId })
  } else {
    rules.value = []
  }
}, { immediate: true })

/**
 * LEARNING: Filtered rules for selected block
 * WHY: Show only rules for currently selected block instance
 * PATTERN: Computed property filters rules array
 */
const filteredRules = computed(() => {
  if (!selectedBlockId.value) return []
  return rules.value.filter(rule => rule.blockInstanceId === selectedBlockId.value)
})

/**
 * LEARNING: Open dialog for creating new rule
 * WHY: Admin clicks "Add Rule" button, opens dialog with empty form
 * PATTERN: Reset form data, set blockInstanceId, open dialog
 */
const openCreateDialog = (): void => {
  editingRule.value = null
  formData.value = {
    blockInstanceId: selectedBlockId.value || '',
    ruleType: 'required_fields',
    ruleConfig: { fields: [] },
    validationMessageAnnotationId: null,
    active: true
  }
  showRuleDialog.value = true
}

/**
 * LEARNING: Open dialog for editing existing rule
 * WHY: Admin clicks "Edit" on rule, opens dialog with pre-filled form
 * PATTERN: Set editingRule, copy rule data to formData, open dialog
 */
const openEditDialog = (rule: BusinessRule): void => {
  editingRule.value = rule
  formData.value = {
    blockInstanceId: rule.blockInstanceId,
    ruleType: rule.ruleType,
    ruleConfig: rule.ruleConfig,
    validationMessageAnnotationId: rule.validationMessageAnnotationId,
    active: rule.active
  }
  showRuleDialog.value = true
}

/**
 * LEARNING: Close dialog and reset form
 * WHY: Admin clicks "Cancel" or finishes create/edit action
 * PATTERN: Reset form data, close dialog, clear editing rule
 */
const closeDialog = (): void => {
  showRuleDialog.value = false
  editingRule.value = null
  formData.value = {
    blockInstanceId: selectedBlockId.value || '',
    ruleType: 'required_fields',
    ruleConfig: { fields: [] },
    validationMessageAnnotationId: null,
    active: true
  }
}

/**
 * LEARNING: Save business rule (create or update)
 * WHY: Admin submits form, calls createRule or updateRule based on editingRule
 * PATTERN: Check if editing, call appropriate method, close dialog on success
 */
const saveRule = async (): Promise<void> => {
  if (editingRule.value) {
    // Update existing rule
    const result = await updateRule(editingRule.value.id, formData.value)
    if (result) {
      closeDialog()
    }
  } else {
    // Create new rule
    const result = await createRule(formData.value)
    if (result) {
      closeDialog()
    }
  }
}

/**
 * LEARNING: Delete business rule with confirmation
 * WHY: Admin clicks "Delete" on rule, confirms, deletes rule
 * PATTERN: Confirm dialog, call deleteRule on confirm
 */
const handleDeleteRule = async (rule: BusinessRule): Promise<void> => {
  if (confirm(`Delete business rule for ${ruleTypeOptions.find(o => o.value === rule.ruleType)?.title}?`)) {
    await deleteRule(rule.id)
  }
}

/**
 * LEARNING: Format rule type for display
 * WHY: Convert rule_type enum to human-readable label
 * PATTERN: Find matching option, return title
 */
const formatRuleType = (ruleType: RuleType): string => {
  return ruleTypeOptions.find(o => o.value === ruleType)?.title || ruleType
}

/**
 * LEARNING: Format rule config for display
 * WHY: Show rule config in a readable format
 * PATTERN: Type-specific formatting based on ruleType
 */
const formatRuleConfig = (rule: BusinessRule): string => {
  switch (rule.ruleType) {
    case 'required_fields':
      const reqFields = rule.ruleConfig as { fields: string[]; condition?: string }
      return `Fields: ${reqFields.fields.join(', ')}${reqFields.condition ? ` (Condition: ${reqFields.condition})` : ''}`
    case 'requires_agent':
      const reqAgent = rule.ruleConfig as { requiresAgent: boolean }
      return `Requires Agent: ${reqAgent.requiresAgent ? 'Yes' : 'No'}`
    case 'conditional_validation':
      const condVal = rule.ruleConfig as { field: string; dependsOn: string; condition: string; value: unknown }
      return `${condVal.field} ${condVal.condition} ${condVal.value} (depends on ${condVal.dependsOn})`
    case 'validation_message':
      const valMsg = rule.ruleConfig as { field: string; messageType: string }
      return `Field: ${valMsg.field}, Type: ${valMsg.messageType}`
    default:
      return JSON.stringify(rule.ruleConfig)
  }
}

/**
 * LEARNING: Computed properties for rule config form fields
 * WHY: v-model bindings for different rule config types
 * PATTERN: Computed with getter/setter for nested object
 */
const requiredFieldsArray = computed({
  get: () => {
    if (formData.value.ruleType === 'required_fields') {
      const config = formData.value.ruleConfig as { fields: string[]; condition?: string }
      return config.fields?.join(', ') || ''
    }
    return ''
  },
  set: (value: string) => {
    if (formData.value.ruleType === 'required_fields') {
      formData.value.ruleConfig = {
        fields: value.split(',').map(f => f.trim()).filter(f => f.length > 0),
        condition: (formData.value.ruleConfig as { fields: string[]; condition?: string }).condition
      }
    }
  }
})

const requiredFieldsCondition = computed({
  get: () => {
    if (formData.value.ruleType === 'required_fields') {
      return (formData.value.ruleConfig as { fields: string[]; condition?: string }).condition || ''
    }
    return ''
  },
  set: (value: string) => {
    if (formData.value.ruleType === 'required_fields') {
      formData.value.ruleConfig = {
        ...formData.value.ruleConfig as { fields: string[]; condition?: string },
        condition: value || undefined
      }
    }
  }
})

const requiresAgent = computed({
  get: () => {
    if (formData.value.ruleType === 'requires_agent') {
      return (formData.value.ruleConfig as { requiresAgent: boolean }).requiresAgent || false
    }
    return false
  },
  set: (value: boolean) => {
    if (formData.value.ruleType === 'requires_agent') {
      formData.value.ruleConfig = { requiresAgent: value }
    }
  }
})

/**
 * LEARNING: Watch ruleType and reset ruleConfig when it changes
 * WHY: Different rule types have different config schemas
 * PATTERN: Watch ruleType, set default config based on type
 */
watch(() => formData.value.ruleType, (newType) => {
  switch (newType) {
    case 'required_fields':
      formData.value.ruleConfig = { fields: [] }
      break
    case 'requires_agent':
      formData.value.ruleConfig = { requiresAgent: false }
      break
    case 'conditional_validation':
      formData.value.ruleConfig = { field: '', dependsOn: '', condition: 'equals', value: '' }
      break
    case 'validation_message':
      formData.value.ruleConfig = { field: '', messageType: 'required' }
      break
  }
})
</script>

<template>
  <div class="business-rules-tab">
    <!-- Loading state -->
    <div v-if="loading && !rules.length" class="text-center py-4">
      <VProgressCircular indeterminate color="primary" />
      <div class="mt-2">Loading business rules...</div>
    </div>
    
    <!-- Main Content -->
    <div v-else>
      <!-- Success message -->
      <VAlert
        v-if="success"
        type="success"
        dismissible
        class="mb-4"
        @click:close="success = null"
      >
        {{ success }}
      </VAlert>
      
      <!-- Error message -->
      <VAlert
        v-if="error"
        type="error"
        dismissible
        class="mb-4"
        @click:close="error = null"
      >
        {{ error }}
      </VAlert>
      
      <!-- Block Instance Selection -->
      <div class="mb-6">
        <div class="text-h6 mb-3">Business Rules Configuration</div>
        <div class="text-body-2 mb-4 text-medium-emphasis">
          Configure validation rules for services and dwelling adjustments. Rules control which fields are required, 
          validation messages, and agent requirements per block instance.
        </div>
        
        <VSelect
          v-model="selectedBlockId"
          :items="availableBlockInstances"
          label="Select Block Instance"
          hint="Choose a service or dwelling adjustment to configure validation rules"
          persistent-hint
          clearable
          class="mb-4"
        />
      </div>
      
      <!-- Rules List -->
      <div v-if="selectedBlockId">
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="text-subtitle-1">
            Rules for {{ availableBlockInstances.find(b => b.value === selectedBlockId)?.title }}
          </div>
          <VBtn
            color="primary"
            @click="openCreateDialog"
            :disabled="!selectedBlockId"
          >
            Add Rule
          </VBtn>
        </div>
        
        <!-- Rules Table -->
        <VCard v-if="filteredRules.length > 0" class="mb-4">
          <VTable>
            <thead>
              <tr>
                <th>Rule Type</th>
                <th>Configuration</th>
                <th>Validation Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rule in filteredRules" :key="rule.id">
                <td>{{ formatRuleType(rule.ruleType) }}</td>
                <td>{{ formatRuleConfig(rule) }}</td>
                <td>
                  <span v-if="rule.validationMessageAnnotationId">
                    {{ availableValidationMessages.find(m => m.value === rule.validationMessageAnnotationId)?.title || 'Linked' }}
                  </span>
                  <span v-else class="text-medium-emphasis">None</span>
                </td>
                <td>
                  <VChip
                    :color="rule.active ? 'success' : 'default'"
                    size="small"
                  >
                    {{ rule.active ? 'Active' : 'Inactive' }}
                  </VChip>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <VBtn
                      size="small"
                      variant="text"
                      icon="mdi-pencil"
                      @click="openEditDialog(rule)"
                    />
                    <VBtn
                      size="small"
                      variant="text"
                      icon="mdi-delete"
                      color="error"
                      @click="handleDeleteRule(rule)"
                    />
                    <VBtn
                      size="small"
                      variant="text"
                      :icon="rule.active ? 'mdi-eye-off' : 'mdi-eye'"
                      @click="toggleRuleActive(rule.id, !rule.active)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
        
        <!-- Empty State -->
        <VCard v-else class="pa-8 text-center">
          <div class="text-h6 mb-2">No Rules Configured</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Add a business rule to configure validation behavior for this block instance.
          </div>
          <VBtn
            color="primary"
            @click="openCreateDialog"
          >
            Add First Rule
          </VBtn>
        </VCard>
      </div>
      
      <!-- No Block Selected State -->
      <VCard v-else class="pa-8 text-center">
        <div class="text-h6 mb-2">Select a Block Instance</div>
        <div class="text-body-2 text-medium-emphasis">
          Choose a service or dwelling adjustment above to view and configure business rules.
        </div>
      </VCard>
    </div>
    
    <!-- Add/Edit Rule Dialog -->
    <VDialog
      v-model="showRuleDialog"
      max-width="600"
      persistent
    >
      <VCard>
        <VCardTitle>
          {{ editingRule ? 'Edit Business Rule' : 'Add Business Rule' }}
        </VCardTitle>
        
        <VCardText>
          <VForm @submit.prevent="saveRule">
            <!-- Rule Type Selection -->
            <VSelect
              v-model="formData.ruleType"
              :items="ruleTypeOptions"
              label="Rule Type"
              required
              class="mb-4"
            />
            
            <!-- Required Fields Config -->
            <div v-if="formData.ruleType === 'required_fields'" class="mb-4">
              <VTextField
                v-model="requiredFieldsArray"
                label="Required Fields"
                hint="Comma-separated field names (e.g., numberOfUnits, deckSquareFootage)"
                persistent-hint
                required
                class="mb-2"
              />
              <VTextField
                v-model="requiredFieldsCondition"
                label="Condition (optional)"
                hint="Condition name (e.g., isMultiFamily, hasDeck)"
                persistent-hint
              />
            </div>
            
            <!-- Requires Agent Config -->
            <div v-if="formData.ruleType === 'requires_agent'" class="mb-4">
              <VSwitch
                v-model="requiresAgent"
                label="Service Requires Agent"
                hint="Enable if this service requires agent and client contact information"
                persistent-hint
              />
            </div>
            
            <!-- Conditional Validation Config (Placeholder) -->
            <VAlert v-if="formData.ruleType === 'conditional_validation'" type="info" variant="tonal" class="mb-4">
              Conditional validation configuration UI coming in future session.
            </VAlert>
            
            <!-- Validation Message Config (Placeholder) -->
            <VAlert v-if="formData.ruleType === 'validation_message'" type="info" variant="tonal" class="mb-4">
              Validation message configuration UI coming in future session.
            </VAlert>
            
            <!-- Validation Message Link -->
            <VSelect
              v-model="formData.validationMessageAnnotationId"
              :items="availableValidationMessages"
              label="Validation Message (optional)"
              hint="Link to annotation instance for validation message"
              persistent-hint
              clearable
              class="mb-4"
            />
            
            <!-- Active Status -->
            <VSwitch
              v-model="formData.active"
              label="Active"
              hint="Enable this rule for validation"
              persistent-hint
            />
          </VForm>
        </VCardText>
        
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="closeDialog"
            :disabled="saving"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            @click="saveRule"
            :loading="saving"
            :disabled="saving"
          >
            {{ editingRule ? 'Update' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.business-rules-tab {
  padding: 1rem;
}
</style>
