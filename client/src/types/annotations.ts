/**
 * Annotation Types
 * 
 * LEARNING: Type definitions for annotation system (descriptions, tooltips, etc.)
 * WHY: Type-safe annotation types separate from relationships
 * PATTERN: Annotation types with metadata for filtering and display
 */

import type { UserTypeBlock } from './userTypes'
import type { AnnotationShapeEntity, AnnotationInstanceEntity } from './entities'

/**
 * AnnotationShape: Shape-level annotation type definitions (core entity)
 * LEARNING: Represents an annotation shape entity (e.g., 'frontPage', 'description', 'tooltip')
 * WHY: Now a core entity with full entity capabilities
 * PATTERN: Extends BaseGlobalEntity via AnnotationShapeEntity
 */
export type AnnotationShape = AnnotationShapeEntity

/**
 * AnnotationInstance: Instance-level annotation entities (core entity)
 * LEARNING: Core annotation properties
 * WHY: Now a core entity with full entity capabilities
 * PATTERN: Extends BaseGlobalEntity via AnnotationInstanceEntity
 * NOTE: The "name" field from BaseGlobalEntity contains the text content
 * The transformer maps API "text" field to entity "name" field
 */
export type AnnotationInstance = AnnotationInstanceEntity & {
  userTypeBlock: UserTypeBlock // BlockInstance ID (GlobalEntityId) or null for generic annotations
  annotationShape?: AnnotationShape // Optional association from API (includes type name)
}

/**
 * Annotation metadata from relationship/through-table
 * LEARNING: Additional metadata stored in AnnotationAssignment through-table
 * WHY: Allows per-instance overrides of order, default flag, and user type
 * PATTERN: Metadata separate from base annotation for flexibility
 */
export type AnnotationMetadata = {
  orderIndex: number
  isDefault: boolean
  userTypeBlock: UserTypeBlock // BlockInstance ID (GlobalEntityId) or null - override from through-table (takes precedence over Annotation.userTypeBlock)
}

/**
 * Annotation with metadata
 * LEARNING: Combined annotation and metadata for display
 * WHY: Merges base annotation with relationship-level metadata
 * PATTERN: Combines Annotation + AnnotationMetadata
 */
export type AnnotationWithMetadata = AnnotationInstance & AnnotationMetadata

/**
 * Annotation map type
 * LEARNING: Map of annotation keys to annotation arrays
 * WHY: Type-safe annotation collections by type
 * PATTERN: Record type with GlobalEntityKey (annotationShape and annotationInstance)
 */
export type AnnotationMap = Record<'annotationShape' | 'annotationInstance', AnnotationWithMetadata[]>

/**
 * BlockInstance response interface
 * LEARNING: BlockInstance entity from API response
 * WHY: Type-safe block instance data handling
 * PATTERN: Matches server-side BlockInstance model structure
 */
export interface BlockInstanceResponse {
  id: string
  name: string
  [key: string]: unknown // Allow additional properties from API
}

/**
 * AnnotationAssignment response interface
 * LEARNING: AnnotationAssignment relationship from API response
 * WHY: Type-safe annotation assignment relationship handling
 * PATTERN: Matches server-side AnnotationAssignment through-table structure
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
 * LEARNING: Combined block instance and annotation assignment data
 * WHY: Type-safe handling of block instance annotations with metadata
 * PATTERN: Extends AnnotationAssignmentResponse with block instance information
 */
export interface BlockInstanceAnnotationResponse extends AnnotationAssignmentResponse {
  blockInstanceId: string
  blockInstanceName: string
  annotationId: string
}

