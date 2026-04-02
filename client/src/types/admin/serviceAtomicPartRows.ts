import type { ComputedRef } from 'vue'
import type { PartInstanceEntity } from '@/types/entities'

/**
 * One row for service block-instance “convergence” / work-item table.
 * Column mapping vs PartInstanceEntity:
 * - name → partInstance.name
 * - baseTime, baseFee, rateOverBaseTime, rateOverBaseFee, zeroOutPart → same-named fields on partInstance
 * - partShapeName → resolved from partShape entity (partInstance.partShapeRef); empty if shape missing
 */
export interface ServiceAtomicPartRow {
  name: string
  baseTime: number
  baseFee: number
  rateOverBaseTime: number
  rateOverBaseFee: number
  zeroOutPart: boolean
  partShapeName: string
  partInstance: PartInstanceEntity
}

export interface UseServiceAtomicPartRowsReturn {
  isServiceBlockInstance: ComputedRef<boolean>
  rows: ComputedRef<ServiceAtomicPartRow[]>
}
