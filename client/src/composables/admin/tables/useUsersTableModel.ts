import { computed } from 'vue'
import { useUser } from '@/composables/useUser'
import { useNotification } from '@/composables/useNotification'
import type { UserRequest, UserResponse } from '@/types/user'
import { useCrudDataTableModel, type CrudDataTableModel } from './useCrudDataTableModel'

export interface UsersTableModel extends CrudDataTableModel<
  UserResponse,
  UserRequest,
  Partial<UserRequest>
> {
  formatNullValue: (value: unknown) => string
}

export function useUsersTableModel(): UsersTableModel {
  const { success, error } = useNotification()
  const { fetchAll, create, update, remove } = useUser()

  const formatNullValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—'
    return String(value)
  }

  const model = useCrudDataTableModel<UserResponse, UserRequest, Partial<UserRequest>>({
    entityLabel: 'User',
    itemsSource: computed(() => {
      const data = fetchAll.data.value
      return Array.isArray(data) ? data : []
    }),
    isLoadingSource: computed(() => fetchAll.isLoading.value),
    errorSource: computed(() => fetchAll.error.value),
    createItem: async (payload) => create.mutateAsync(payload),
    updateItem: async (id, payload) => update.mutateAsync({ id, data: payload }),
    deleteItem: async (id) => remove.mutateAsync(id),
    notifySuccess: (message) => success(message),
    notifyError: (message) => error(message),
    getCreateDefaults: () => ({ userRole: 'client' }) as UserRequest,
    validateCreate: (payload) => {
      if (!payload.firstName || !payload.lastName || !payload.email) {
        return 'First name, last name, and email are required'
      }
      return null
    },
    mapItemToEditPayload: (user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || null,
      userRole: user.userRole,
      loginId: user.loginId || null,
    }),
  })

  return {
    ...model,
    formatNullValue,
  }
}


