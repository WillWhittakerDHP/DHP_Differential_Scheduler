import { computed, type ComputedRef } from 'vue'
import { useProperty } from '@/composables/useProperty'
import { useUser } from '@/composables/useUser'
import type { AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'
import { getAppointmentFieldFormatter } from '@/utils/appointmentFieldFormatters'

export interface AppointmentsTableLookups {
  properties: ComputedRef<PropertyResponse[]>
  users: ComputedRef<UserResponse[]>
  getDisplayValue: (appointment: AppointmentResponse, field: string) => string
  getPropertyById: (propertyVersionId: string | null | undefined) => PropertyResponse | undefined
  getUserById: (userId: string | null | undefined) => UserResponse | undefined
  getPropertyTypeNames: (propertyVersionId: string | null | undefined) => string
}

const isAppointmentResponseKey = (obj: AppointmentResponse, field: string): field is keyof AppointmentResponse =>
  field in obj

export function useAppointmentsTableLookups(): AppointmentsTableLookups {
  const { fetchAll: fetchProperties } = useProperty()
  const { fetchAll: fetchUsers } = useUser()

  const properties = computed<PropertyResponse[]>(() => {
    const data = fetchProperties.data.value
    return Array.isArray(data) ? data : []
  })

  const users = computed<UserResponse[]>(() => {
    const data = fetchUsers.data.value
    return Array.isArray(data) ? data : []
  })

  const getDisplayValue = (appointment: AppointmentResponse, field: string): string => {
    const value = isAppointmentResponseKey(appointment, field) ? appointment[field] : undefined
    const formatter = getAppointmentFieldFormatter(field)
    return formatter(appointment, value, properties.value, users.value)
  }

  const getPropertyById = (propertyVersionId: string | null | undefined): PropertyResponse | undefined => {
    if (!propertyVersionId) return undefined
    return properties.value.find((p) => p.propertyVersionId === propertyVersionId || p.id === propertyVersionId)
  }

  const getUserById = (userId: string | null | undefined): UserResponse | undefined => {
    if (!userId) return undefined
    return users.value.find((u) => u.id === userId)
  }

  const getPropertyTypeNames = (propertyVersionId: string | null | undefined): string => {
    const property = getPropertyById(propertyVersionId)
    if (!property?.propertyTypes || property.propertyTypes.length === 0) return '—'

    const names = property.propertyTypes.map((pt) => pt.blockInstance?.name).filter(Boolean)

    return names.length ? names.join(', ') : '—'
  }

  return {
    properties,
    users,
    getDisplayValue,
    getPropertyById,
    getUserById,
    getPropertyTypeNames,
  }
}
