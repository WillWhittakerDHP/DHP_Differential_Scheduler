/**
 */
import { useQuery } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import {
  getPropertyFieldMappingsEndpoint,
  getPropertyFeatureMappingsEndpoint,
} from '@/utils/api'
import type { Ref } from 'vue'

export interface PropertyFieldMappingRow {
  id: string
  dataSource: string
  sourceField: string
  targetField: string
  valueMapping: Record<string, unknown> | null
  fallbackValue: string | null
  active: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PropertyFeatureMappingRow {
  id: string
  dataSource: string
  sourceField: string
  matchType: string
  matchValue: string | null
  blockInstanceId: string
  blockInstance?: { id: string; name: string }
  active: boolean
  priority: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export function usePropertyMappingsTab(isTabActive: Ref<boolean>): {
  fieldMappings: Ref<PropertyFieldMappingRow[] | undefined>
  fieldMappingsLoading: Ref<boolean>
  featureMappings: Ref<PropertyFeatureMappingRow[] | undefined>
  featureMappingsLoading: Ref<boolean>
} {
  const {
    data: fieldMappings,
    isLoading: fieldMappingsLoading,
  } = useQuery({
    queryKey: ['property-field-mappings'],
    queryFn: async () => {
      const res = await apiClient.get<PropertyFieldMappingRow[]>(
        getPropertyFieldMappingsEndpoint()
      )
      return res.data
    },
    enabled: isTabActive,
  })

  const {
    data: featureMappings,
    isLoading: featureMappingsLoading,
  } = useQuery({
    queryKey: ['property-feature-mappings'],
    queryFn: async () => {
      const res = await apiClient.get<PropertyFeatureMappingRow[]>(
        getPropertyFeatureMappingsEndpoint()
      )
      return res.data
    },
    enabled: isTabActive,
  })

  return {
    fieldMappings,
    fieldMappingsLoading,
    featureMappings,
    featureMappingsLoading,
  }
}
