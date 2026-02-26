import { computed, ref } from 'vue'
import type {
  CrudDataTableModelGrouped,
  CrudDataTableModelOptions,
} from '@/types/admin/tables/crudDataTableModel'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useCrudDataTableModel')

export function useCrudDataTableModel<
  TableItem extends { id: string },
  CreatePayload extends object,
  UpdatePayload extends object
>(options: CrudDataTableModelOptions<TableItem, CreatePayload, UpdatePayload>): CrudDataTableModelGrouped<
  TableItem,
  CreatePayload,
  UpdatePayload
> {
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
  const editedData = ref<Partial<UpdatePayload>>({})

  const isCreating = ref<boolean>(false)
  const newItem = ref<CreatePayload>(getCreateDefaults())

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
    } catch (error) {
      logger.error('Failed to update', { error, entityLabel, editingId: editingId.value })
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
    } catch (error) {
      logger.error('Failed to create', { error, entityLabel })
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
    } catch (error) {
      logger.error('Failed to delete', { error, entityLabel, deletingId: deletingId.value })
      notifyError(`Failed to delete ${entityLabel.toLowerCase()}`)
    }
  }

  return {
    data: { items, isLoading, error },
    editState: { editingId, editedData, isCreating, newItem },
    dialogs: { showDeleteDialog, deletingId },
    actions: {
      startEdit,
      cancelEdit,
      saveEdit,
      startCreate,
      cancelCreate,
      saveCreate,
      openDeleteDialog,
      cancelDelete,
      confirmDelete,
    },
  }
}
