// Global entity ID type
export type GlobalEntityId = string;

import type { GlobalEntityKey } from "@/constants/entities";
import type { BlockShapeType } from "@/constants/blockShapeTypes";
import type { TernaryBoolean } from "./ternary";

/**
 * Base entity interface with common properties
 */
interface BaseGlobalEntity<GE extends GlobalEntityKey> {
  id: GlobalEntityId;
  entityKey: GE;
  // Common properties that exist on all entities
  name: string;
  orderIndex: number;
  active: boolean;
  /**
   * LEARNING: BlockInstance entities include a `bookingMode` enum field.
   * WHY: Controls where and how the instance appears in booking flows.
   * NOTE: Only blockInstance uses this, so it remains optional in the base type.
   */
  bookingMode?: import('@/constants/entities').BookingMode;
  // Component properties (optional - only present if entity participates in component relationships)
  instanceComponents?: GlobalEntityId[]; // IDs of entities that are instance components of this composer
  isComposer?: boolean; // True if this entity is a composer (has components)
}

/**
 * Specific entity type definitions with their unique properties
 */
export interface BlockInstanceEntity extends BaseGlobalEntity<"blockInstance"> {
  blockShapeRef: string;
  baseSqFt: number;
  active: boolean;
  composite?: boolean; // If true, this instance is intended to be composite (composed of components)
  // NOTE: Annotations are accessed via relationships.annotationAssignments, not attached directly to entities
  icon: string;
  allowMultiple: boolean; // Whether this block instance can be multiplied by ADU count or number
  /**
   * If true, this instance requires a unit number (e.g., condo/co-op).
   * Nullable by design (treat only `true` as requiring a unit number).
   */
  requiresUnitNumber?: boolean | null;
  /**
   * Whether this service supports differential scheduling (inspector and client have different arrival times).
   * 'override' means differential is disabled regardless of service setting.
   */
  differential?: TernaryBoolean;
}

export interface BlockShapeEntity extends BaseGlobalEntity<"blockShape"> {
  type: BlockShapeType; // Semantic type identifier: 'user', 'service', 'property', 'option'
  composable: boolean;
  canHaveParts: boolean; // If true, blockInstances of this shape can have parts (partInstances). Mutually exclusive with isStateControl.
  isStateControl: boolean; // If true, acts as state selector in wizard (like User Types). Mutually exclusive with canHaveParts.
  // Relationship fields (attached by transformers)
  validCascades?: GlobalEntityId[];
  validParts?: GlobalEntityId[];
  validAnnotations?: GlobalEntityId[];
}

export interface PartInstanceEntity extends BaseGlobalEntity<"partInstance"> {
  partShapeRef: string;
  // NOTE: onSite, clientPresent, and moveable are no longer stored in the database.
  // They are computed from EventAssignment relationships in globalToBookingTransformer
  // and only exist in BookingPartInstance (computed type).
  baseTime: number;
  rateOverBaseTime: number;
  baseFee: number;
  rateOverBaseFee: number;
  active: boolean;
  zeroOutPart: boolean;
  // Relationship fields (attached by transformers)
  eventAssignments?: GlobalEntityId[];
}

export interface PartShapeEntity extends BaseGlobalEntity<"partShape"> {
  // Relationship fields (attached by transformers)
  validEvents?: GlobalEntityId[];
}

export interface EventShapeEntity extends BaseGlobalEntity<"eventShape"> {
  isTernary: boolean; // Indicates if this event shape uses ternary logic (true/false/override)
  ternaryDefault: 'true' | 'false' | 'override' | null; // Default ternary value (null means fail gracefully)
  // Relationship fields (attached by transformers)
  attendees?: GlobalEntityId[]; // Array of UserTypeBlock BlockInstance IDs (attendees for this event)
}

export interface EventInstanceEntity extends BaseGlobalEntity<"eventInstance"> {
  eventShapeRef: string;
  titleTemplate: string | null;
  descriptionTemplate: string | null;
  locationTemplate: string | null;
}

export interface AnnotationShapeEntity extends BaseGlobalEntity<"annotationShape"> {
}

export interface AnnotationInstanceEntity extends BaseGlobalEntity<"annotationInstance"> {
  // Note: "name" field from BaseGlobalEntity contains the text content
  // Transformer maps API "text" field to entity "name" field
  type: string; // Foreign key to AnnotationShape.id
  userTypeBlock: string | null; // BlockInstance ID or null (deprecated, use annotation_assignments.user_type_block_instance_id)
}

/**
 * Main GlobalEntity type that maps to specific entity interfaces
 * This eliminates complex type intersections and provides clean, flat entity structures
 */
export type GlobalEntity<GE extends GlobalEntityKey> = 
  GE extends "blockInstance" ? BlockInstanceEntity :
  GE extends "blockShape" ? BlockShapeEntity :
  GE extends "partInstance" ? PartInstanceEntity :
  GE extends "partShape" ? PartShapeEntity :
  GE extends "eventShape" ? EventShapeEntity :
  GE extends "eventInstance" ? EventInstanceEntity :
  GE extends "annotationShape" ? AnnotationShapeEntity :
  GE extends "annotationInstance" ? AnnotationInstanceEntity :
  never;

// Entity maps
export type GlobalEntityMap = {
  [GE in GlobalEntityKey]: GlobalEntity<GE>[];
};

