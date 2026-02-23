/**
 * Annotation Types
 * 
 */

import type { UserTypeBlock } from './userTypes'
import type { AnnotationShapeEntity, AnnotationInstanceEntity } from './entities'

/**
 * AnnotationShape: Shape-level annotation type definitions (core entity)
 */
export type AnnotationShape = AnnotationShapeEntity

/**
 * AnnotationInstance: Instance-level annotation entities (core entity)
 * NOTE: The "name" field from BaseGlobalEntity contains the text content
 * The transformer maps API "text" field to entity "name" field
 */
export type AnnotationInstance = AnnotationInstanceEntity & {
  userTypeBlock: UserTypeBlock // BlockInstance ID (GlobalEntityId) or null for generic annotations
  annotationShape?: AnnotationShape // Optional association from API (includes type name)
}

/**
 * Annotation metadata from relationship/through-table
 */
export type AnnotationMetadata = {
  orderIndex: number
  isDefault: boolean
  userTypeBlock: UserTypeBlock // BlockInstance ID (GlobalEntityId) or null - override from through-table (takes precedence over Annotation.userTypeBlock)
}

/**
 * Annotation with metadata
 */
export type AnnotationWithMetadata = AnnotationInstance & AnnotationMetadata

/**
 * Annotation map type
 */
export type AnnotationMap = Record<'annotationShape' | 'annotationInstance', AnnotationWithMetadata[]>

/**
 * BlockInstance response interface
 */
export interface BlockInstanceResponse {
  id: string
  name: string
  [key: string]: unknown // Allow additional properties from API
}

/**
 * AnnotationAssignment response interface
 */
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

/**
 * BlockInstanceAnnotation response interface
 */
export interface BlockInstanceAnnotationResponse extends AnnotationAssignmentResponse {
  blockInstanceId: string
  blockInstanceName: string
  annotationId: string
}

