<!--
  RequiredConfirmationModal – reusable confirmation modal shell (Phase 6.4).
  LEARNING: Single shell for "required confirmation before next step" modals.
  WHY: MoveablePartsModal and PropertyConfirmationModal share VDialog+VCard+title+close+body+actions;
       extract once so dynamic title and progressive/mini-wizard behavior live in one place.
  PATTERN: v-model open, title prop (dynamic), default slot for body, optional actions (props or slot).
  Phase 6.4 UX: max-width 520px, ~400ms open delay, scale-transition.
-->
<template>
  <VDialog
    v-model="showModalDelayed"
    max-width="520"
    scrollable
    transition="scale-transition"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-headline-medium">{{ title }}</span>
        <VBtn
          icon
          variant="text"
          aria-label="Close"
          @click="handleCancel"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="pa-6">
        <slot />
      </VCardText>

      <VCardActions class="pa-6">
        <slot
          name="actions"
          :can-confirm="canConfirm"
          :on-cancel="handleCancel"
          :on-confirm="handleConfirm"
        >
          <VSpacer />
          <VBtn
            color="secondary"
            variant="tonal"
            @click="handleCancel"
          >
            {{ secondaryLabel }}
          </VBtn>
          <VBtn
            color="primary"
            variant="elevated"
            :disabled="!canConfirm"
            @click="handleConfirm"
          >
            {{ primaryLabel }}
          </VBtn>
        </slot>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/** Phase 6.4: ~400ms delay before opening so modal feels less intrusive. */
const OPEN_DELAY_MS = 400

interface Props {
  modelValue: boolean
  /** Dynamic title (e.g. "Schedule Report Writing" or "Confirm {blockInstance.name} details"). */
  title: string
  /** Primary button label. */
  primaryLabel?: string
  /** Secondary button label. */
  secondaryLabel?: string
  /** When false, primary button is disabled. */
  canConfirm?: boolean
}

const props = withDefaults(
  defineProps<Props>(),
  {
    primaryLabel: 'Confirm',
    secondaryLabel: 'Cancel',
    canConfirm: true,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const showModalModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const showModalDelayedInner = ref(false)
let openTimeoutId: ReturnType<typeof setTimeout> | null = null
watch(showModalModel, (val) => {
  if (openTimeoutId) {
    window.clearTimeout(openTimeoutId)
    openTimeoutId = null
  }
  if (val) {
    openTimeoutId = window.setTimeout(() => {
      showModalDelayedInner.value = true
      openTimeoutId = null
    }, OPEN_DELAY_MS)
  } else {
    showModalDelayedInner.value = false
  }
}, { immediate: true })

const showModalDelayed = computed({
  get: () => showModalDelayedInner.value,
  set: (value: boolean) => {
    showModalDelayedInner.value = value
    if (!value) emit('update:modelValue', false)
  },
})

function handleConfirm(): void {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel(): void {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
