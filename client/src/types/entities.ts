import type { GlobalEntityId } from '@shared/types/primitiveBrands'

export type { GlobalEntityId }

import type { GlobalEntityKey } from "@/constants/entities";
import type { BlockShapeType } from "@/constants/blockShapeTypes";
import type { TernaryBoolean } from "./ternary";
import type { DifferentialRole } from '@shared/types/differentialRole'

/** Index signature allows dynamic field access (e.g. dependencyCleanup, store sync) without type escape. */
interface GlobalEntityBase<GE extends GlobalEntityKey> {
  id: GlobalEntityId;
  entityKey: GE;
  name: string;
  orderIndex: number;
  active: boolean;
  instanceComponents?: GlobalEntityId[]; // IDs of entities that are instance components of this composer
  isComposer?: boolean; // True if this entity is a composer (has components)
  [key: string]: unknown;
}

export interface BlockInstanceEntity extends GlobalEntityBase<"blockInstance"> {
  blockShapeRef: string;
  baseSqFt: number;
  active: boolean;
  /** Stored as ternary_boolean; map to BookingMode at booking boundary. */
  bookingMode?: TernaryBoolean;
  agentPermissions?: TernaryBoolean;
  composite?: boolean; // If true, this instance is intended to be composite (composed of components)
  annotations?: BlockInstanceAnnotation[]; // Embedded annotations for optimistic updates and fast reads
  description?: string; // Derived description from annotations for display
  icon: string;
  allowMultiple: boolean; // Whether this block instance can be multiplied by ADU count or number
  requiresUnitNumber?: boolean | null;
  differential?: TernaryBoolean;
  preClosing?: boolean;
  isMultiFamily: boolean;
  requiresAgent: boolean;
}

export interface BlockShapeEntity extends GlobalEntityBase<"blockShape"> {
  type: BlockShapeType; // Semantic type identifier: 'user', 'service', 'property', 'option'
  composable: boolean;
  canHaveParts: boolean; // If true, blockInstances of this shape can have parts (partInstances). Mutually exclusive with isStateControl.
  isStateControl: boolean; // If true, acts as state selector in wizard (like User Types). Mutually exclusive with canHaveParts.
  validCascades?: GlobalEntityId[];
  validParts?: GlobalEntityId[];
  validAnnotations?: GlobalEntityId[];
}

export interface PartInstanceEntity extends GlobalEntityBase<"partInstance"> {
  partShapeRef: string;
  baseTime: number;
  rateOverBaseTime: number;
  baseFee: number;
  rateOverBaseFee: number;
  active: boolean;
  zeroOutPart: boolean;
  eventAssignments?: GlobalEntityId[];
}

export interface PartShapeEntity extends GlobalEntityBase<"partShape"> {
  validEvents?: GlobalEntityId[];
}

export interface EventShapeEntity extends GlobalEntityBase<"eventShape"> {
  isTernary: boolean; // Indicates if this event shape uses ternary logic (true/false/override)
  ternaryDefault: 'true' | 'false' | 'override' | null; // Default ternary value (null means fail gracefully)
  /** DB NULL = none (normalized on API hydrate). */
  differentialRole: DifferentialRole;
  /** When false, calendar invite templates strip `{rescheduleLink}` for instances of this shape. */
  includeRescheduleLink: boolean;
  /** When false, calendar invite templates strip `{cancelLink}` for instances of this shape. */
  includeCancelLink: boolean;
  attendees?: GlobalEntityId[]; // Array of UserTypeBlock BlockInstance IDs (attendees for this event)
}

export interface EventInstanceEntity extends GlobalEntityBase<"eventInstance"> {
  eventShapeRef: string;
  titleTemplate: string | null;
  descriptionTemplate: string | null;
  locationTemplate: string | null;
  visibility: 'default' | 'public' | 'private' | 'confidential';
  transparency: 'opaque' | 'transparent';
  guestsCanModify: boolean;
  guestsCanInviteOthers: boolean;
  guestsCanSeeOtherGuests: boolean;
  addConferenceLink: boolean;
  sendUpdates: 'all' | 'externalOnly' | 'none';
  colorId: string | null;
  status: 'confirmed' | 'tentative';
  reminderOverrides: Array<{ method: 'email' | 'popup'; minutes: number }> | null;
  /** Virtual: visibility in metadata controls inclusion in display/export; value from appointment at invite time */
  scheduledBy?: string | null;
}

export interface AnnotationShapeEntity extends GlobalEntityBase<"annotationShape"> {
  /** Wizard slot from ANNOTATION_UI_SLOT_REGISTRY, or null/omitted when unset. */
  uiSlot?: string | null
}

export interface AnnotationInstanceEntity extends GlobalEntityBase<"annotationInstance"> {
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
