/**
 * PATTERN: Service-only part rows for admin atomic / convergence table (session 20.3.2).
 * Delegates to useAtomicPartLedgerRows with shape type **service**.
 */
import type { MaybeRefOrGetter } from 'vue'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { UseServiceAtomicPartRowsReturn } from '@/types/admin/serviceAtomicPartRows'
import { useAtomicPartLedgerRows } from '@/composables/admin/useAtomicPartLedgerRows'

const SERVICE_ONLY = [BLOCK_SHAPE_TYPES.SERVICE] as const

export function useServiceAtomicPartRows(blockInstanceId: MaybeRefOrGetter<string>): UseServiceAtomicPartRowsReturn {
  const { matchesShapeGate, rows } = useAtomicPartLedgerRows(blockInstanceId, SERVICE_ONLY)
  return {
    isServiceBlockInstance: matchesShapeGate,
    rows,
  }
}
