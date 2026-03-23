import type { ComputedRef, Ref } from 'vue'
import type { UserRequest, UserResponse } from '@/types/user'
import type { AdminDataTableHeader } from '@/types/admin/tables/adminDataTableHeader'

export interface UsersTableDataGridContext {
  headers: AdminDataTableHeader[]
  tableItems: ComputedRef<UserResponse[]>
  editingId: Ref<string | null>
  editedData: Ref<Partial<UserRequest>>
  isLoading: ComputedRef<boolean>
  formatNullValue: (value: unknown) => string
  startEdit: (item: UserResponse) => void
  cancelEdit: () => void
  saveEdit: () => Promise<void>
  openDeleteDialog: (id: string) => void
}
