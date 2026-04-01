/**
 * Orchestrates admin dependency-aware delete: preflight → blocked | confirm → finalize.
 * WHY: Single state machine for 6.17.4 wiring; thin components call named actions only.
 */

import { computed, reactive, ref, type Ref } from 'vue'
import type {
  DeleteContractErrorCode,
  DeletePreflightResponse,
} from '@shared/types/adminDeleteDependency'
import {
  DeleteContractApiError,
  extractDeleteContractError,
  fetchDeletePreflight,
  postDeleteFinalize,
} from '@/utils/api/entityDeleteContractApi'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAdminEntityDeleteWizard')

type AdminEntityDeleteWizardPhase =
  | 'idle'
  | 'loading_preflight'
  | 'ready'
  | 'blocked'
  | 'finalizing'
  | 'success'
  | 'error'

/**
 * Read-only wizard state after `reactive({ ...computed })` — Vue unwraps refs; this matches script/template types for vue-tsc.
 */
export interface AdminEntityDeleteWizardState {
  phase: AdminEntityDeleteWizardPhase
  preflight: DeletePreflightResponse | null
  lastError: string | null
  lastErrorCode: DeleteContractErrorCode | undefined
  isBlocked: boolean
  canConfirmDelete: boolean
  isBusy: boolean
  dependencySummaryLines: string[]
}

interface AdminEntityDeleteWizardActions {
  reset: () => void
  runPreflight: (entityKey: string, entityId: string) => Promise<void>
  confirmFinalize: (entityKey: string, entityId: string) => Promise<void>
}

interface UseAdminEntityDeleteWizardReturn {
  state: AdminEntityDeleteWizardState
  actions: AdminEntityDeleteWizardActions
}

function buildDependencySummaryLines(preflight: DeletePreflightResponse | null): string[] {
  if (preflight == null) {
    return []
  }
  const lines: string[] = []
  for (const reason of preflight.blockedReasons ?? []) {
    lines.push(reason)
  }
  for (const edge of preflight.edges) {
    const msg = edge.message ?? edge.policy
    lines.push(msg)
  }
  return lines
}

export function useAdminEntityDeleteWizard(): UseAdminEntityDeleteWizardReturn {
  const phaseRef: Ref<AdminEntityDeleteWizardPhase> = ref('idle')
  const preflightRef: Ref<DeletePreflightResponse | null> = ref(null)
  const lastErrorRef: Ref<string | null> = ref(null)
  const lastErrorCodeRef: Ref<DeleteContractErrorCode | undefined> = ref(undefined)

  const phase = computed(() => phaseRef.value)
  const preflight = computed(() => preflightRef.value)
  const lastError = computed(() => lastErrorRef.value)
  const lastErrorCode = computed(() => lastErrorCodeRef.value)

  const isBlocked = computed(() => phaseRef.value === 'blocked')

  const canConfirmDelete = computed(() => {
    if (phaseRef.value !== 'ready') {
      return false
    }
    const p = preflightRef.value
    if (p == null || !p.canDirectDelete) {
      return false
    }
    const token = p.preflightToken
    return typeof token === 'string' && token.length > 0
  })

  const isBusy = computed(
    () => phaseRef.value === 'loading_preflight' || phaseRef.value === 'finalizing'
  )

  const dependencySummaryLines = computed(() => buildDependencySummaryLines(preflightRef.value))

  function reset(): void {
    phaseRef.value = 'idle'
    preflightRef.value = null
    lastErrorRef.value = null
    lastErrorCodeRef.value = undefined
  }

  async function runPreflight(entityKey: string, entityId: string): Promise<void> {
    lastErrorRef.value = null
    lastErrorCodeRef.value = undefined
    preflightRef.value = null
    phaseRef.value = 'loading_preflight'
    try {
      const result = await fetchDeletePreflight(entityKey, entityId)
      preflightRef.value = result
      phaseRef.value = result.canDirectDelete ? 'ready' : 'blocked'
    } catch (err: unknown) {
      const mapped =
        err instanceof DeleteContractApiError ? err : extractDeleteContractError(err)
      logger.warn('admin delete preflight failed', {
        message: mapped.message,
        code: mapped.code,
        httpStatus: mapped.httpStatus,
      })
      lastErrorRef.value = mapped.message
      lastErrorCodeRef.value = mapped.code
      phaseRef.value = 'error'
    }
  }

  async function confirmFinalize(entityKey: string, entityId: string): Promise<void> {
    const p = preflightRef.value
    const token = p?.preflightToken
    if (phaseRef.value !== 'ready' || p == null || typeof token !== 'string' || token === '') {
      return
    }
    lastErrorRef.value = null
    lastErrorCodeRef.value = undefined
    phaseRef.value = 'finalizing'
    try {
      await postDeleteFinalize(entityKey, entityId, {
        entityType: entityKey,
        entityId,
        preflightToken: token,
      })
      phaseRef.value = 'success'
    } catch (err: unknown) {
      const mapped =
        err instanceof DeleteContractApiError ? err : extractDeleteContractError(err)
      logger.warn('admin delete finalize failed', {
        message: mapped.message,
        code: mapped.code,
        httpStatus: mapped.httpStatus,
      })
      lastErrorRef.value = mapped.message
      lastErrorCodeRef.value = mapped.code
      phaseRef.value = 'error'
    }
  }

  const state = reactive({
    phase,
    preflight,
    lastError,
    lastErrorCode,
    isBlocked,
    canConfirmDelete,
    isBusy,
    dependencySummaryLines,
  }) as AdminEntityDeleteWizardState

  return {
    state,
    actions: {
      reset,
      runPreflight,
      confirmFinalize,
    },
  }
}
