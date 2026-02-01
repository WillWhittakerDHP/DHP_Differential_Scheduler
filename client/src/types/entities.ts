export type GlobalEntityId = string;

import type { GlobalEntityKey } from "@/constants/entities";
import type { BlockShapeType } from "@/constants/blockShapeTypes";
import type { TernaryBoolean } from "./ternary";

interface BaseGlobalEntity<GE extends GlobalEntityKey> {
  id: GlobalEntityId;
  entityKey: GE;
  name: string;
  orderIndex: number;
  active: boolean;
  bookingMode?: import('@/constants/entities').BookingMode;
  instanceComponents?: GlobalEntityId[]; // IDs of entities that are instance components of this composer
  isComposer?: boolean; // True if this entity is a composer (has components)
}

export interface BlockInstanceEntity extends BaseGlobalEntity<"blockInstance"> {
  blockShapeRef: string;
  baseSqFt: number;
  active: boolean;
  composite?: boolean; // If true, this instance is intended to be composite (composed of components)
  annotations?: import('@/types/annotations').AnnotationWithMetadata[]; // Embedded annotations for optimistic updates and fast reads
  description?: string; // Derived description from annotations (for legacy support)
  icon: string;
  allowMultiple: boolean; // Whether this block instance can be multiplied by ADU count or number
  requiresUnitNumber?: boolean | null;
  differential?: TernaryBoolean;
  is_multi_family?: boolean;
  requires_agent?: boolean;
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

export interface AnnotationShapeEntity extends BaseGlobalEntity<"annotationShape"> {
}

export interface AnnotationInstanceEntity extends BaseGlobalEntity<"annotationInstance"> {
  type: string; // Foreign key to AnnotationShape.id
  userTypeBlock: string | null; // BlockInstance ID or null (deprecated, use annotation_assignments.user_type_block_instance_id)
}

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

export type GlobalEntityMap = {
  [GE in GlobalEntityKey]: GlobalEntity<GE>[];
};

