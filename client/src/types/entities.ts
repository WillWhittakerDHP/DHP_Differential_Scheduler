import type { GlobalEntityId } from '@shared/types/primitiveBrands'

export type { GlobalEntityId }

import type { GlobalEntityKey } from "@/constants/entities";
import type { BlockShapeType } from "@/constants/blockShapeTypes";
import type { EventAnchorEdge, EventPlacementKind } from '@shared/utils/eventPlacementUtils'
import type { WizardPlacement } from '@shared/constants/wizardPlacement'
/** Index signature allows dynamic field access (e.g. dependencyCleanup, store sync) without type escape. */
interface GlobalEntityBase<GE extends GlobalEntityKey> {
  id: GlobalEntityId;
  entityKey: GE;
  name: string;
  orderIndex: number;
  instanceComponents?: GlobalEntityId[]; // IDs of entities that are instance components of this composer
  isComposer?: boolean; // True if this entity is a composer (has components)
  [key: string]: unknown;
}

export interface BlockInstanceEntity extends GlobalEntityBase<"blockInstance"> {
  blockShapeRef: string;
  composite?: boolean; // If true, this instance is intended to be composite (composed of components)
  /** When true, this block coordinates differential scheduling for selected services. */
  orchestrator?: boolean;
  /** Four-state wizard placement (hidden / topLine / subOption / both); replaces the old wizardVisible boolean. */
  wizardPlacement?: WizardPlacement;
  annotations?: BlockInstanceAnnotation[]; // Embedded annotations for optimistic updates and fast reads
  description?: string; // Derived description from annotations for display
  icon: string;
  /** Not persisted on `block_instances` when column is absent; booking defaults to false. */
  allowMultiple?: boolean;
  requiresUnitNumber?: boolean | null;
  preClosing?: boolean;
  isMultiFamily: boolean;
  requiresAgent: boolean;
  /** Assigned event instances (parent_kind = blockInstance on event_assignments). */
  eventAssignments?: GlobalEntityId[];
  /** Canonical user role (USER_ROLE_VALUES) when parent shape is user-semantic; null if unset. */
  semanticType?: string | null;
}

export interface BlockShapeEntity extends GlobalEntityBase<"blockShape"> {
  semanticType: BlockShapeType; // App-wide semantic identifier: 'user', 'service', 'time', 'event', 'price'
  validBookingCascades?: GlobalEntityId[];
  validPartCascades?: GlobalEntityId[];
  validAnnotationAssignments?: GlobalEntityId[];
  /** Which event shapes are allowed for block instances of this shape (`valid_event_cascades.parent_id` = block shape). */
  validEventCascades?: GlobalEntityId[];
}

export interface PartInstanceEntity extends GlobalEntityBase<"partInstance"> {
  partShapeRef: string;
  baseTime: number;
  timePerUnit: number;
  baseFee: number;
  feePerUnit: number;
  active: boolean;
  zeroOutPart: boolean;
}

export type PartShapeEntity = GlobalEntityBase<"partShape">

export interface EventShapeEntity extends GlobalEntityBase<"eventShape"> {
  active: boolean;
  /** Feature 20 placement type (event_shapes.placement_kind). */
  placementKind: EventPlacementKind
  /** null for primary; start | end for other kinds. */
  anchorEdge: EventAnchorEdge | null
  attendees?: GlobalEntityId[] // Union of segment attendee user-types, merged client-side for booking
}

export interface EventInstanceEntity extends GlobalEntityBase<"eventInstance"> {
  active: boolean;
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
  parentBlockInstanceId?: string | null;
  locationType?: string | null;
  locationPlaceId?: string | null;
  locationAddress?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  includeRescheduleLink: boolean;
  includeCancelLink: boolean;
  /** Virtual: visibility in metadata controls inclusion in display/export; value from appointment at invite time */
  scheduledBy?: string | null;
}

export interface AnnotationShapeEntity extends GlobalEntityBase<"annotationShape"> {
  active: boolean;
  /** Wizard slot from ANNOTATION_UI_SLOT_REGISTRY, or null/omitted when unset. */
  uiSlot?: string | null
}

export interface AnnotationInstanceEntity extends GlobalEntityBase<"annotationInstance"> {
  active: boolean;
  type: string; // Foreign key to AnnotationShape.id
  text?: string
  /** From batch when server exposes content rows for wizard resolution (task 6.12.2.2). */
  contentRows?: ReadonlyArray<{ text: string; userTypeBlockInstanceId: string | null }>
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
