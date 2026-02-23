import { computed, ref, type ComputedRef, type Ref } from 'vue'

export interface CrudDataTableModelOptions<
  TableItem extends { id: string },
  CreatePayload extends object,
  UpdatePayload extends object
> {
  /** Human-friendly entity label for notifications (e.g., "Appointment") */
  entityLabel: string

  /** Source items (usually a Vue Query `fetchAll.data`) */
  itemsSource: ComputedRef<TableItem[]>

  /** Loading/error sources (usually Vue Query flags) */
  isLoadingSource: ComputedRef<boolean>
  errorSource: ComputedRef<unknown>

  /** Create/update/delete operations */
  createItem: (payload: CreatePayload) => Promise<unknown>
  updateItem: (id: string, payload: UpdatePayload) => Promise<unknown>
  deleteItem: (id: string) => Promise<unknown>

  /** Notifications */
  notifySuccess: (message: string) => void
  notifyError: (message: string) => void

  /** Create-mode defaults + validation */
  getCreateDefaults: () => CreatePayload
  validateCreate: (payload: CreatePayload) => string | null

  /** Edit-mode mapping */
  mapItemToEditPayload: (item: TableItem) => UpdatePayload
}

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

export function useCrudDataTableModel<
  TableItem extends { id: string },
  CreatePayload extends object,
  UpdatePayload extends object
>(options: CrudDataTableModelOptions<TableItem, CreatePayload, UpdatePayload>): CrudDataTableModel<TableItem, CreatePayload, UpdatePayload> {
  const {
    entityLabel,
    itemsSource,
    isLoadingSource,
    errorSource,
    createItem,
    updateItem,
    deleteItem,
    notifySuccess,
    notifyError,
    getCreateDefaults,
    validateCreate,
    mapItemToEditPayload,
  } = options

  const items = computed<TableItem[]>(() => itemsSource.value)
  const isLoading = computed<boolean>(() => isLoadingSource.value)
  const error = computed<unknown>(() => errorSource.value)

  const editingId = ref<string | null>(null)
  const editedData = ref<Partial<UpdatePayload>>({}) as Ref<Partial<UpdatePayload>>

  const isCreating = ref<boolean>(false)
  const newItem = ref<CreatePayload>(getCreateDefaults()) as Ref<CreatePayload>

  const showDeleteDialog = ref<boolean>(false)
  const deletingId = ref<string | null>(null)

  const startEdit = (item: TableItem): void => {
    editingId.value = item.id
    editedData.value = mapItemToEditPayload(item)
  }

  const cancelEdit = (): void => {
    editingId.value = null
    editedData.value = {}
  }

  const saveEdit = async (): Promise<void> => {
    if (!editingId.value) return

    try {
      await updateItem(editingId.value, editedData.value as UpdatePayload)
      notifySuccess(`${entityLabel} updated successfully`)
      cancelEdit()
    } catch (_error) {
      notifyError(`Failed to update ${entityLabel.toLowerCase()}`)
    }
  }

  const startCreate = (): void => {
    isCreating.value = true
    newItem.value = getCreateDefaults()
  }

  const cancelCreate = (): void => {
    isCreating.value = false
    newItem.value = getCreateDefaults()
  }

  const saveCreate = async (): Promise<void> => {
    const validationError = validateCreate(newItem.value)
    if (validationError) {
      notifyError(validationError)
      return
    }

    try {
      await createItem(newItem.value)
      notifySuccess(`${entityLabel} created successfully`)
      cancelCreate()
    } catch (_error) {
      notifyError(`Failed to create ${entityLabel.toLowerCase()}`)
    }
  }

  const openDeleteDialog = (id: string): void => {
    deletingId.value = id
    showDeleteDialog.value = true
  }

  const cancelDelete = (): void => {
    showDeleteDialog.value = false
    deletingId.value = null
  }

  const confirmDelete = async (): Promise<void> => {
    if (!deletingId.value) return

    try {
      await deleteItem(deletingId.value)
      notifySuccess(`${entityLabel} deleted successfully`)
      cancelDelete()
    } catch (_error) {
      notifyError(`Failed to delete ${entityLabel.toLowerCase()}`)
    }
  }

  return {
    items,
    isLoading,
    error,
    editingId,
    editedData,
    isCreating,
    newItem,
    showDeleteDialog,
    deletingId,
    startEdit,
    cancelEdit,
    saveEdit,
    startCreate,
    cancelCreate,
    saveCreate,
    openDeleteDialog,
    cancelDelete,
    confirmDelete,
  }
}


