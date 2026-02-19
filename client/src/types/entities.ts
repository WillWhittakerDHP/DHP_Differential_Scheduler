/**
 * Branded type for global entity IDs.
 * WHY: Prevents passing arbitrary strings where an entity ID is expected.
 * PATTERN: Same as RFC3339DateTime in client/src/types/datetime.ts
 */
export type GlobalEntityId = string & { readonly __brand: "GlobalEntityId" };

export function toGlobalEntityId(value: string): GlobalEntityId {
  return value as GlobalEntityId;
}

export function toGlobalEntityIdOrNull(
  value: string | null | undefined
): GlobalEntityId | null {
  return value != null ? (value as GlobalEntityId) : null;
}

import type { GlobalEntityKey } from "@/constants/entities";
import type { BlockShapeType } from "@/constants/blockShapeTypes";
import type { BookingMode } from "@/constants/bookingMode";
import type { TernaryBoolean } from "./ternary";

/** Index signature allows dynamic field access (e.g. dependencyCleanup, store sync) without type escape. */
interface BaseGlobalEntity<GE extends GlobalEntityKey> {
  id: GlobalEntityId;
  entityKey: GE;
  name: string;
  orderIndex: number;
  active: boolean;
  bookingMode?: BookingMode;
  instanceComponents?: GlobalEntityId[]; // IDs of entities that are instance components of this composer
  isComposer?: boolean; // True if this entity is a composer (has components)
  [key: string]: unknown;
}

export interface BlockInstanceEntity extends BaseGlobalEntity<"blockInstance"> {
  blockShapeRef: string;
  baseSqFt: number;
  active: boolean;
  composite?: boolean; // If true, this instance is intended to be composite (composed of components)
  annotations?: BlockInstanceAnnotation[]; // Embedded annotations for optimistic updates and fast reads
  description?: string; // Derived description from annotations for display
  icon: string;
  allowMultiple: boolean; // Whether this block instance can be multiplied by ADU count or number
  requiresUnitNumber?: boolean | null;
  differential?: TernaryBoolean;
  isMultiFamily: boolean;
  requiresAgent: boolean;
}

export interface BlockShapeEntity extends BaseGlobalEntity<"blockShape"> {
  type: BlockShapeType; // Semantic type identifier: 'user', 'service', 'property', 'option'
  composable: boolean;
  canHaveParts: boolean; // If true, blockInstances of this shape can have parts (partInstances). Mutually exclusive with isStateControl.
  isStateControl: boolean; // If true, acts as state selector in wizard (like User Types). Mutually exclusive with canHaveParts.
  validCascades?: GlobalEntityId[];
  validParts?: GlobalEntityId[];
  validAnnotations?: GlobalEntityId[];
}

export interface PartInstanceEntity extends BaseGlobalEntity<"partInstance"> {
  partShapeRef: string;
  baseTime: number;
  rateOverBaseTime: number;
  baseFee: number;
  rateOverBaseFee: number;
  active: boolean;
  zeroOutPart: boolean;
  eventAssignments?: GlobalEntityId[];
}

export interface PartShapeEntity extends BaseGlobalEntity<"partShape"> {
  validEvents?: GlobalEntityId[];
}

export interface EventShapeEntity extends BaseGlobalEntity<"eventShape"> {
  isTernary: boolean; // Indicates if this event shape uses ternary logic (true/false/override)
  ternaryDefault: 'true' | 'false' | 'override' | null; // Default ternary value (null means fail gracefully)
  attendees?: GlobalEntityId[]; // Array of UserTypeBlock BlockInstance IDs (attendees for this event)
}

export interface EventInstanceEntity extends BaseGlobalEntity<"eventInstance"> {
  eventShapeRef: string;
  titleTemplate: string | null;
  descriptionTemplate: string | null;
  locationTemplate: string | null;
}

export type AnnotationShapeEntity = BaseGlobalEntity<"annotationShape">

export interface AnnotationInstanceEntity extends BaseGlobalEntity<"annotationInstance"> {
  type: string; // Foreign key to AnnotationShape.id
}

/** Inline annotation type to avoid circular import with annotations.ts */
type BlockInstanceAnnotation = AnnotationInstanceEntity & {
  userTypeBlock: GlobalEntityId | null;
  annotationShape?: AnnotationShapeEntity;
  orderIndex: number;
  isDefault: boolean;
};

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
