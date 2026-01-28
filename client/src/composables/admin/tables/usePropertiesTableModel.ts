import { useProperty } from '@/composables/useProperty'
import { useNotification } from '@/composables/useNotification'
import type { PropertyRequest, PropertyResponse } from '@/types/property'
import { useCrudDataTableModel, type CrudDataTableModel } from './useCrudDataTableModel'
import { formatNullValue, createItemsSource } from './useTableModelHelpers'

export interface PropertiesTableModel extends CrudDataTableModel<
  PropertyResponse,
  PropertyRequest,
  Partial<PropertyRequest>
> {
  formatNullValue: (value: unknown) => string
}

export function usePropertiesTableModel(): PropertiesTableModel {
  const { success, error } = useNotification()
  const { fetchAll, create, update, remove } = useProperty()

  const model = useCrudDataTableModel<PropertyResponse, PropertyRequest, Partial<PropertyRequest>>({
    entityLabel: 'Property',
    itemsSource: createItemsSource(fetchAll.data),
    isLoadingSource: computed(() => fetchAll.isLoading.value),
    errorSource: computed(() => fetchAll.error.value),
    createItem: async (payload) => create.mutateAsync(payload),
    updateItem: async (id, payload) => update.mutateAsync({ id, data: payload }),
    deleteItem: async (id) => remove.mutateAsync(id),
    notifySuccess: (message) => success(message),
    notifyError: (message) => error(message),
    getCreateDefaults: () => ({}) as PropertyRequest,
    validateCreate: (payload) => {
      if (!payload.address || !payload.city || !payload.state || !payload.zipCode) {
        return 'Address, city, state, and zip code are required'
      }
      return null
    },
    mapItemToEditPayload: (property) => ({
      address: property.address,
      unit: property.unit || null,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      mlsNumber: property.mlsNumber || null,
      squareFootage: property.squareFootage || null,
      bedrooms: property.bedrooms || null,
      bathrooms: property.bathrooms || null,
      foundationAccess: property.foundationAccess || null,
      additionalUnits: property.additionalUnits || null,
    }),
  })

  return {
    ...model,
    formatNullValue,
  }
}


