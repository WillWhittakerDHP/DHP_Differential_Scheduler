import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

export interface StatusButtonField {
  key: GlobalFieldKey<GlobalEntityKey>
  label: string
  color: string
  order: number
}
