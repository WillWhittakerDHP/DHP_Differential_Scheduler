import type { ComputedRef, Ref } from 'vue'
import type { TableModelFormatHelpers } from '@/composables/admin/tables/useTableModelHelpers'

export interface CrudDataTableModelOptions<
  TableItem extends { id: string },
  CreatePayload extends object,
  UpdatePayload extends object
> {
  entityLabel: string
  itemsSource: ComputedRef<TableItem[]>
  isLoadingSource: ComputedRef<boolean>
  errorSource: ComputedRef<unknown>
  createItem: (payload: CreatePayload) => Promise<unknown>
  updateItem: (id: string, payload: UpdatePayload) => Promise<unknown>
  deleteItem: (id: string) => Promise<unknown>
  notifySuccess: (message: string) => void
  notifyError: (message: string) => void
  getCreateDefaults: () => CreatePayload
  validateCreate: (payload: CreatePayload) => string | null
  mapItemToEditPayload: (item: TableItem) => UpdatePayload
}

/** Flat shape (table model composables spread grouped into this). */
export interface CrudDataTableModel<
  TableItem extends { id: string },
  CreatePayload extends object,
  UpdatePayload extends object
> {
  items: ComputedRef<TableItem[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown>
  editingId: Ref<string | null>
  editedData: Ref<Partial<UpdatePayload>>
  isCreating: Ref<boolean>
  newItem: Ref<CreatePayload>
  showDeleteDialog: Ref<boolean>
  deletingId: Ref<string | null>
  startEdit: (item: TableItem) => void
  cancelEdit: () => void
  saveEdit: () => Promise<void>
  startCreate: () => void
  cancelCreate: () => void
  saveCreate: () => Promise<void>
  openDeleteDialog: (id: string) => void
  cancelDelete: () => void
  confirmDelete: () => Promise<void>
}

/** Grouped return for composable-health (oversized-return repair). */
export interface CrudDataTableModelGrouped<
  TableItem extends { id: string },
  CreatePayload extends object,
  UpdatePayload extends object
> {
  data: {
    items: ComputedRef<TableItem[]>
    isLoading: ComputedRef<boolean>
    error: ComputedRef<unknown>
  }
  editState: {
    editingId: Ref<string | null>
    editedData: Ref<Partial<UpdatePayload>>
    isCreating: Ref<boolean>
    newItem: Ref<CreatePayload>
  }
  dialogs: {
    showDeleteDialog: Ref<boolean>
    deletingId: Ref<string | null>
  }
  actions: {
    startEdit: (item: TableItem) => void
    cancelEdit: () => void
    saveEdit: () => Promise<void>
    startCreate: () => void
    cancelCreate: () => void
    saveCreate: () => Promise<void>
    openDeleteDialog: (id: string) => void
    cancelDelete: () => void
    confirmDelete: () => Promise<void>
  }
}

/** CRUD table model plus {@link TableModelFormatHelpers} (shared admin table composable return). */
export type CrudDataTableModelWithFormatHelpers<
  TableItem extends { id: string },
  CreatePayload extends object,
  UpdatePayload extends object
> = CrudDataTableModel<TableItem, CreatePayload, UpdatePayload> & TableModelFormatHelpers
