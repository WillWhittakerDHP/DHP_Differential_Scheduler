import type { ComputedRef, Ref } from 'vue'
import type { PropertyRequest, PropertyResponse } from '@/types/property'
import type { AdminDataTableHeader } from '@/types/admin/tables/adminDataTableHeader'

export interface PropertiesTableDataGridContext {
  headers: AdminDataTableHeader[]
  tableItems: ComputedRef<PropertyResponse[]>
  editingId: Ref<string | null>
  editedData: Ref<Partial<PropertyRequest>>
  isLoading: ComputedRef<boolean>
  formatNullValue: (value: unknown) => string
  startEdit: (item: PropertyResponse) => void
  cancelEdit: () => void
  saveEdit: () => Promise<void>
  openDeleteDialog: (id: string) => void
}
