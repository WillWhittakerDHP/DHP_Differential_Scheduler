import { computed } from 'vue'
import { USER_ROLE_CLIENT } from '@/constants/attendeeRoles'
import { useUser } from '@/composables/useUser'
import { useNotification } from '@/composables/useNotification'
import type { UserRequest, UserResponse } from '@/types/user'
import { useCrudDataTableModel } from './useCrudDataTableModel'
import { formatNullValue, createItemsSource, type TableModelFormatHelpers } from './useTableModelHelpers'

import type { CrudDataTableModel } from '@/types/admin/tables/crudDataTableModel'
export interface UsersTableModel extends CrudDataTableModel<
  UserResponse,
  UserRequest,
  Partial<UserRequest>
>, TableModelFormatHelpers {}

export function useUsersTableModel(): UsersTableModel {
  const { success, error } = useNotification()
  const { fetchAll, create, update, remove } = useUser()

  const crud = useCrudDataTableModel<UserResponse, UserRequest, Partial<UserRequest>>({
    entityLabel: 'User',
    itemsSource: createItemsSource(fetchAll.data),
    isLoadingSource: computed(() => fetchAll.isLoading.value),
    errorSource: computed(() => fetchAll.error.value),
    createItem: async (payload) => create.mutateAsync(payload),
    updateItem: async (id, payload) => update.mutateAsync({ id, data: payload }),
    deleteItem: async (id) => remove.mutateAsync(id),
    notifySuccess: (message) => success(message),
    notifyError: (message) => error(message),
    getCreateDefaults: () => ({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      userRole: USER_ROLE_CLIENT,
      loginId: undefined,
    }) as UserRequest,
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
    ...crud.data,
    ...crud.editState,
    ...crud.dialogs,
    ...crud.actions,
    formatNullValue,
  } as UsersTableModel
}


