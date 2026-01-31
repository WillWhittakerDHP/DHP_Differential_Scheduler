/**
 * Annotation Types
 * 
 * LEARNING: Type definitions for annotation system (descriptions, tooltips, etc.)
 * WHY: Type-safe annotation types separate from relationships
 * PATTERN: Annotation types with metadata for filtering and display
 */

import type { UserTypeBlock } from './userTypes'
import type { GlobalAnnotationKey } from '@/constants/annotations'

/**
 * AnnotationShape type (from API)
 * LEARNING: Represents an annotation shape entity (e.g., 'frontPage', 'description', 'tooltip')
 * WHY: Types are fully dynamic and managed via CRUD
 * PATTERN: Simple entity with id and name
 * 
 * ARCHITECTURAL CHANGE: Metadata stored as columns in annotation_shapes table
 * WHY: Shape columns are always metadata - relationships just indicate which shapes are active
 * PATTERN: Metadata (orderIndex, isDefault) lives in shape table, not in relationship tables
 */
export type AnnotationShape = {
  id: string
  name: string // e.g., 'frontPage', 'description', 'tooltip'
  defaultOrderIndex?: number  // Default order index for this annotation shape
  defaultIsDefault?: boolean  // Default isDefault flag for this annotation shape
}

/**
 * Base annotation type
 * LEARNING: Core annotation properties
 * WHY: Shared structure for all annotation types
 * PATTERN: Simple object with id, text, type, and user type
 */
export type AnnotationInstance = {
  id: string
  text: string
  type: string // Foreign key to AnnotationShape.id (UUID)
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
 * PATTERN: Record type with GlobalAnnotationKey
 */
export type AnnotationMap = Record<GlobalAnnotationKey, AnnotationWithMetadata[]>

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

