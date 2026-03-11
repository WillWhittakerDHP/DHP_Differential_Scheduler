/**
 * Accordion/expansion state and focus management for AvailabilityStep narrow layout.
 * Extracted to reduce component script size (vue-architecture audit): DOM and watch logic
 * live here; component keeps only wiring and template.
 *
 * WHY: Component Authoring Playbook — Tier1 hotspots (watch, dom) belong in composables.
 * PATTERN: Flat return (narrowExpanded, onExpandedChange, onHeaderKeydown); mutations via
 * explicit actions; no Ref|ComputedRef unions at boundary.
 */
import { ref, watch, nextTick, onMounted, type ComputedRef, type Ref } from 'vue'

export interface UseAvailabilityStepAccordionParams {
  /** Current step index (0-based); accordion syncs expanded panel to this. */
  currentStepIndex: ComputedRef<number>
  /** ID prefix for content region (e.g. 'availability-substep-content-'). */
  contentIdPrefix?: string
  /** ID prefix for title/header (e.g. 'availability-substep-title-'). */
  titleIdPrefix?: string
}

export interface UseAvailabilityStepAccordionReturn {
  /** Single expanded panel index; -1 = all collapsed. */
  narrowExpanded: Ref<number>
  /** Call when user expands/collapses a panel (click or keyboard). */
  setExpanded: (expandedIndex: number) => void
  /** Keyboard handler for Enter/Space on headers (WAI-ARIA accordion). */
  onHeaderKeydown: (stepIndex: number) => void
}

const DEFAULT_CONTENT_PREFIX = 'availability-substep-content-'
const DEFAULT_TITLE_PREFIX = 'availability-substep-title-'

/** Step indices that show slot buttons (focus first .appointment-slot-btn when expanding). */
const SLOT_STEP_INDICES = new Set([3, 4])

function focusFirstFocusableInContent(stepIndex: number, contentIdPrefix: string): void {
  nextTick(() => {
    const contentEl = document.getElementById(`${contentIdPrefix}${stepIndex}`)
    if (!contentEl) return
    const slotStep = SLOT_STEP_INDICES.has(stepIndex)
    const firstSlot = slotStep
      ? contentEl.querySelector<HTMLElement>('.appointment-slot-btn:not([disabled])')
      : null
    const focusable =
      firstSlot ??
      contentEl.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    if (focusable) {
      focusable.focus()
      focusable.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

function focusHeader(stepIndex: number, titleIdPrefix: string): void {
  const headerEl = document.getElementById(`${titleIdPrefix}${stepIndex}`)
  ;(headerEl as HTMLElement | null)?.focus()
}

export function useAvailabilityStepAccordion(
  params: UseAvailabilityStepAccordionParams
): UseAvailabilityStepAccordionReturn {
  const currentStepIndex = params.currentStepIndex
  const contentIdPrefix = params.contentIdPrefix ?? DEFAULT_CONTENT_PREFIX
  const titleIdPrefix = params.titleIdPrefix ?? DEFAULT_TITLE_PREFIX

  const narrowExpanded = ref<number>(0)

  watch(
    currentStepIndex,
    (idx) => {
      narrowExpanded.value = idx
    },
    { immediate: false }
  )

  watch(
    narrowExpanded,
    (newVal, oldVal) => {
      if (newVal >= 0) {
        focusFirstFocusableInContent(newVal, contentIdPrefix)
      } else if (oldVal >= 0) {
        focusHeader(oldVal, titleIdPrefix)
      }
    },
    { flush: 'post' }
  )

  onMounted(() => {
    nextTick(() => {
      narrowExpanded.value = currentStepIndex.value
    })
  })

  function setExpanded(expandedIndex: number): void {
    narrowExpanded.value = expandedIndex
  }

  function onHeaderKeydown(stepIndex: number): void {
    const next = narrowExpanded.value === stepIndex ? -1 : stepIndex
    setExpanded(next)
  }

  return {
    narrowExpanded,
    setExpanded,
    onHeaderKeydown,
  }
}
