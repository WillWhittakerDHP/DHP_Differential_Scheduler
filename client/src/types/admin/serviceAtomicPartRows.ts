import type { ComputedRef } from 'vue'
import type { PartInstanceEntity } from '@/types/entities'

/**
 * One row for service block-instance “convergence” / work-item table.
 * Column mapping vs PartInstanceEntity:
 * - name → partInstance.name
 * - baseTime, baseFee, timePerUnit, baseMultiplier, rateMultiplier, feePerUnit, zeroOutPart → same-named fields on partInstance
 * - partShapeName → resolved from partShape entity (partInstance.partShapeRef); empty if shape missing
 */
export interface ServiceAtomicPartRow {
  name: string
  baseTime: number
  baseFee: number
  timePerUnit: number
  baseMultiplier: number
  rateMultiplier: number
  feePerUnit: number
  zeroOutPart: boolean
  partShapeName: string
  partInstance: PartInstanceEntity
}

/** Generic gate + rows for any block shape type(s) that use the same part-ledger columns. */
export interface UseAtomicPartLedgerRowsReturn {
  matchesShapeGate: ComputedRef<boolean>
  rows: ComputedRef<ServiceAtomicPartRow[]>
}

export interface UseServiceAtomicPartRowsReturn {
  isServiceBlockInstance: ComputedRef<boolean>
  rows: ComputedRef<ServiceAtomicPartRow[]>
}
