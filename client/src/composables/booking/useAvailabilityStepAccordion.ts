/**
 * Accordion/expansion state and focus management for AvailabilityStep.
 * Extracted to reduce component script size (vue-architecture audit): DOM and watch logic
 * live here; component keeps only wiring and template.
 *
 * WHY: Component Authoring Playbook — Tier1 hotspots (watch, dom) belong in composables.
 * explicit actions; no Ref|ComputedRef unions at boundary.
 */
import { ref, watch, nextTick, onMounted, type ComputedRef, type Ref } from 'vue'
import {
  focusAccordionHeader,
  focusFirstFocusableInContent,
} from '@/utils/dom/availabilityAccordionFocus'

interface UseAvailabilityStepAccordionParams {
  /** Current step index (0-based); accordion syncs expanded panel to this. */
  currentStepIndex: ComputedRef<number>
  /** ID prefix for content region (e.g. 'availability-substep-content-'). */
  contentIdPrefix?: string
  /** ID prefix for title/header (e.g. 'availability-substep-title-'). */
  titleIdPrefix?: string
}

export interface UseAvailabilityStepAccordionReturn {
  /** Single expanded panel index; -1 = all collapsed. */
  expandedIndex: Ref<number>
  /** Call when user expands/collapses a panel (click or keyboard). */
  setExpanded: (expandedIndex: number) => void
  /** Keyboard handler for Enter/Space on headers (WAI-ARIA accordion). */
  onHeaderKeydown: (stepIndex: number) => void
}

const DEFAULT_CONTENT_PREFIX = 'availability-substep-content-'
const DEFAULT_TITLE_PREFIX = 'availability-substep-title-'

export function useAvailabilityStepAccordion(
  params: UseAvailabilityStepAccordionParams
): UseAvailabilityStepAccordionReturn {
  const currentStepIndex = params.currentStepIndex
  const contentIdPrefix = params.contentIdPrefix ?? DEFAULT_CONTENT_PREFIX
  const titleIdPrefix = params.titleIdPrefix ?? DEFAULT_TITLE_PREFIX

  const expandedIndex = ref<number>(0)

  watch(
    currentStepIndex,
    (idx) => {
      expandedIndex.value = idx
    },
    { immediate: false }
  )

  watch(
    expandedIndex,
    (newVal, oldVal) => {
      if (newVal >= 0) {
        focusFirstFocusableInContent(newVal, contentIdPrefix)
      } else if (oldVal >= 0) {
        focusAccordionHeader(oldVal, titleIdPrefix)
      }
    },
    { flush: 'post' }
  )

  onMounted(() => {
    nextTick(() => {
      expandedIndex.value = currentStepIndex.value
    })
  })

  function setExpanded(index: number): void {
    expandedIndex.value = index
  }

  function onHeaderKeydown(stepIndex: number): void {
    const next = expandedIndex.value === stepIndex ? -1 : stepIndex
    setExpanded(next)
  }

  return {
    expandedIndex,
    setExpanded,
    onHeaderKeydown,
  }
}
