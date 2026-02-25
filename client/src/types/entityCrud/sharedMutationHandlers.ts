import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

export interface InvalidateEntityQueriesOptions {
  entityKey: string
  relationshipKey?: string
  refetchGlobalData?: boolean
}

export interface MutationContextWithPreviousData {
  previousGlobalData?: GlobalData
  [key: string]: unknown
}
