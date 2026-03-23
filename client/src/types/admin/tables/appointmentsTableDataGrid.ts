import type { ComputedRef, Ref } from 'vue'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'

/** Editable appointment row (shape from useAppointmentsTableModel). */
export type AppointmentsTableEditedData = Partial<AppointmentRequest>

export interface AppointmentsTableDataGridContext {
  tableItems: ComputedRef<AppointmentResponse[]>
  isLoading: ComputedRef<boolean>
  editingId: Ref<string | null>
  editedData: Ref<AppointmentsTableEditedData>
  editingClientId: Ref<string | null>
  editingAgentId: Ref<string | null>
  properties: ComputedRef<PropertyResponse[]>
  users: ComputedRef<UserResponse[]>
  getDisplayValue: (item: AppointmentResponse, field: string) => string
  getPropertyById: (id: string | null | undefined) => PropertyResponse | undefined
  getUserById: (id: string | null | undefined) => UserResponse | undefined
  getPropertyTypeNames: (propertyVersionId: string | null | undefined) => string
  getStatusColor: (status: string) => string
  getRoleColor: (role: string | undefined) => string
  formatTimestamp: (value: string | null | undefined) => string
  navigateToProperties: () => void
  navigateToUsers: () => void
  handleSaveEdit: () => void | Promise<void>
  handleCancelEdit: () => void
  handleOpenConfirmDialog: (item: AppointmentResponse) => void
  handleStartEdit: (item: AppointmentResponse) => void
  markCancelled: (id: string) => void | Promise<boolean>
  openDeleteDialog: (id: string) => void
}
