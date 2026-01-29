// Global entity ID type
export type GlobalEntityId = string;

import type { GlobalEntityKey } from "@/constants/entities";
import type { AnnotationWithMetadata } from "./annotations";
import type { BlockShapeType } from "@/constants/blockShapeTypes";

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
  annotations?: AnnotationWithMetadata[]; // Array of annotations with metadata for user-type filtering
  icon: string;
  allowMultiple: boolean; // Whether this block instance can be multiplied by ADU count or number
  /**
   * If true, this instance requires a unit number (e.g., condo/co-op).
   * Nullable by design (treat only `true` as requiring a unit number).
   */
  requiresUnitNumber?: boolean | null;
  /**
   * If true, this service supports differential scheduling (inspector and client have different arrival times).
   */
  differential?: boolean;
}

export interface BlockShapeEntity extends BaseGlobalEntity<"blockShape"> {
  type: BlockShapeType; // Semantic type identifier: 'user', 'service', 'property', 'option'
  composable: boolean;
  canHaveParts: boolean; // If true, blockInstances of this shape can have parts (partInstances). Mutually exclusive with isStateControl.
  isStateControl: boolean; // If true, acts as state selector in wizard (like User Types). Mutually exclusive with canHaveParts.
}

export interface PartInstanceEntity extends BaseGlobalEntity<"partInstance"> {
  partShapeRef: string;
  onSite: boolean;
  clientPresent: boolean;
  moveable: boolean;
  baseTime: number;
  rateOverBaseTime: number;
  baseFee: number;
  rateOverBaseFee: number;
  active: boolean;
  zeroOutPart: boolean;
}

export interface PartShapeEntity extends BaseGlobalEntity<"partShape"> {
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
  never;

// Entity maps
export type GlobalEntityMap = {
  [GE in GlobalEntityKey]: GlobalEntity<GE>[];
};

