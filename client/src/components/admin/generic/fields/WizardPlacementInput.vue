<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="false"
    :show-help="false"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <!-- WHY: Matches the boolean status buttons on the title row — a compact chip the admin
         clicks to cycle states — instead of a dropdown, per owner request. -->
    <VTooltip location="top" open-delay="300">
      <template #activator="{ props: tooltipActivatorProps }">
        <div v-bind="tooltipActivatorProps">
          <StatusButton
            :label="displayLabel"
            :color="statusButtonColor"
            :is-active="isActiveVisual"
            :disabled="isDisabled"
            @click.stop="handleClick"
          />
        </div>
      </template>
      <span>{{ tooltipText }}</span>
    </VTooltip>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * WHY: `wizardPlacement` is a placement enum (hidden / base / additional / option only / base or additional). The owner asked
 * for a click-through button that looks like the other title-row flags rather than a dropdown, and
 * for the description to appear only on hover (a tooltip) rather than as always-visible field text.
 *
 * PATTERN: Dedicated field-input widget dispatched by `getFieldComponent` (mirrors the
 * `eventShapePlacement` precedent), reusing `StatusButton` + `VTooltip` for identical look-and-feel
 * to the boolean buttons. Kept isolated so the shared boolean/ternary status-button machinery stays
 * strictly two/three-state and is not destabilised by this domain-specific state cycle.
 */
import { computed, inject, ref } from 'vue'
import BaseInput from './BaseInput.vue'
import StatusButton from '../StatusButton.vue'
import { useFieldValue } from '@/composables/useFieldValue'
import { usePrimitiveMutation } from '@/composables/entityCrud/usePrimitiveMutation'
import { ENTITY_CARD_SAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import type { FieldInputProps } from './fieldTypes'
import type { GlobalEntityKey } from '@/constants/entities'
import {
  WIZARD_PLACEMENT,
  cycleWizardPlacement,
  resolveWizardPlacement,
  type WizardPlacement,
} from '@shared/constants/wizardPlacement'
import { createLogger } from '@/utils/logger'

const logger = createLogger('WizardPlacementInput')

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true,
})

const { fieldContext } = props

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

const rawFieldValue = useFieldValue(fieldContext)

const placement = computed<WizardPlacement>(() => resolveWizardPlacement(rawFieldValue.value))

/** Short, human labels for the chip. Prefixed so the button reads clearly among the other flags. */
const PLACEMENT_LABELS: Record<WizardPlacement, string> = {
  [WIZARD_PLACEMENT.HIDDEN]: 'Wizard: Hidden',
  [WIZARD_PLACEMENT.TOP_LINE]: 'Wizard: Base',
  [WIZARD_PLACEMENT.ADDITIONAL]: 'Wizard: Additional',
  [WIZARD_PLACEMENT.SUB_OPTION]: 'Wizard: Option only',
  [WIZARD_PLACEMENT.BOTH]: 'Wizard: Base or additional',
}

/** Readable Vuetify theme colours per state (hidden renders as a muted outline via isActive=false). */
const PLACEMENT_COLORS: Record<WizardPlacement, string> = {
  [WIZARD_PLACEMENT.HIDDEN]: 'primary',
  [WIZARD_PLACEMENT.TOP_LINE]: 'success',
  [WIZARD_PLACEMENT.ADDITIONAL]: 'secondary',
  [WIZARD_PLACEMENT.SUB_OPTION]: 'info',
  [WIZARD_PLACEMENT.BOTH]: 'warning',
}

const displayLabel = computed(() => PLACEMENT_LABELS[placement.value])
const statusButtonColor = computed(() => PLACEMENT_COLORS[placement.value])

// WHY: StatusButton uses `isActive=false` to render the muted outlined variant — perfect for "hidden".
const isActiveVisual = computed(() => placement.value !== WIZARD_PLACEMENT.HIDDEN)

const tooltipText = computed((): string => {
  const help = fieldContext.state.displayConfig.helpText
  if (help === undefined || help === null) {
    return 'Where this block appears in the booking wizard'
  }
  const trimmed = String(help).trim()
  return trimmed.length > 0 ? trimmed : 'Where this block appears in the booking wizard'
})

const isDisabled = computed(
  () => fieldContext.state.displayConfig.disabled || fieldContext.state.displayConfig.readOnly
)

const entityKey = computed(() => fieldContext.state.entityKey as GlobalEntityKey | undefined)
const { mutateAsync } = usePrimitiveMutation(
  (entityKey.value ?? 'blockInstance') as GlobalEntityKey
)

const isSaving = ref(false)

async function handleClick(event: Event): Promise<void> {
  event.stopPropagation()
  event.preventDefault()

  if (isDisabled.value || isSaving.value) {
    return
  }

  const next = cycleWizardPlacement(placement.value)

  // WHY: Unsaved card — write into the form, saved on the card's own save action.
  if (entityCardSaveContext?.isNew) {
    fieldContext.actions.setValue(next)
    return
  }

  const entityId = fieldContext.state.entityId
  if (!entityId) {
    logger.warn('Cannot persist wizardPlacement: missing entityId', {
      entityKey: entityKey.value,
    })
    return
  }

  isSaving.value = true
  try {
    await mutateAsync({
      admin: { key: String(fieldContext.state.fieldKey), value: next },
      dynamicId: entityId,
    })
  } catch (error) {
    logger.warn('Failed to update wizardPlacement', { error, entityId })
  } finally {
    isSaving.value = false
  }
}
</script>
