
import type { UserTypeBlock } from './userTypes'
import type { AnnotationShapeEntity, AnnotationInstanceEntity } from './entities'

export type AnnotationShape = AnnotationShapeEntity

export type AnnotationInstance = AnnotationInstanceEntity & {
  userTypeBlock: UserTypeBlock // BlockInstance ID (GlobalEntityId) or null for generic annotations
  annotationShape?: AnnotationShape // Optional association from API (includes type name)
}

export type AnnotationMetadata = {
  orderIndex: number
  isDefault: boolean
  userTypeBlock: UserTypeBlock // BlockInstance ID (GlobalEntityId) or null - override from through-table (takes precedence over Annotation.userTypeBlock)
}

export type AnnotationWithMetadata = AnnotationInstance & AnnotationMetadata

export type AnnotationMap = Record<'annotationShape' | 'annotationInstance', AnnotationWithMetadata[]>

export interface BlockInstanceResponse {
  id: string
  name: string
  [key: string]: unknown // Allow additional properties from API
}

export interface AnnotationAssignmentResponse {
  id: string
  annotationId: string
  blockInstanceId: string
  orderIndex: number
  isDefault: boolean
  userTypeBlock?: string | null
  userTypeBlockBlockInstanceId?: string | null
  [key: string]: unknown // Allow additional properties from API
}

export interface BlockInstanceAnnotationResponse extends AnnotationAssignmentResponse {
  blockInstanceId: string
  blockInstanceName: string
  annotationId: string
}

