import { computed } from 'vue'
import { useProperty } from '@/composables/useProperty'
import { useNotification } from '@/composables/useNotification'
import type { PropertyRequest, PropertyResponse } from '@/types/property'
import { useCrudDataTableModel, type CrudDataTableModel } from './useCrudDataTableModel'

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

  const formatNullValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—'
    return String(value)
  }

  const model = useCrudDataTableModel<PropertyResponse, PropertyRequest, Partial<PropertyRequest>>({
    entityLabel: 'Property',
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


