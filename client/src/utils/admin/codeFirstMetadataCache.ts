/**
 * Code-first admin field metadata (Feature 20.6.1.1).
 * WHY: Replaces legacy metadata batch HTTP; FieldRenderer and entity cards resolve entries here.
 */
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { FIELD_LAYOUT, FIELD_PANEL, FIELD_RENDER_AS, FIELD_VISIBILITY } from '@/constants/fieldMetadataEnums'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { DISPLAY_LABELS, FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { MetadataCache } from '@/types/admin/metadataCache'
import { determinePanelFromFieldKey } from '@/utils/forms/fieldPanelFromKey'
import { ANNOTATION_UI_SLOT_REGISTRY } from '@shared/constants/annotationSlots'
import { USER_ROLE_VALUES } from '@shared/constants/roleConstants'
import {
  codeFirstBlockInstanceSelectInputs,
  codeFirstBlockShapeSelectInputs,
  codeFirstPartInstanceSelectInputs,
  codeFirstPartShapeSelectInputs,
  EVENT_SHAPE_ATTENDEE_ASSIGNMENTS_INPUT_CONFIG,
  PART_INSTANCE_EVENT_ASSIGNMENTS_INPUT_CONFIG,
} from '@/utils/admin/codeFirstSelectInputConfigs'

const R = FIELD_RENDER_AS
const V = FIELD_VISIBILITY
const L = FIELD_LAYOUT
const P = FIELD_PANEL

function panelFor(key: string): FieldMetadataEntry['panel'] {
  return determinePanelFromFieldKey(key) as FieldMetadataEntry['panel']
}

function mk(
  fieldKey: string,
  label: string,
  displayOrder: number,
  base: Pick<FieldMetadataEntry, 'dataType' | 'renderAs'> &
    Partial<Omit<FieldMetadataEntry, 'dataType' | 'renderAs' | 'label' | 'displayOrder'>>
): FieldMetadataEntry {
  return {
    label,
    displayOrder,
    dataType: base.dataType,
    renderAs: base.renderAs,
    isRequired: base.isRequired ?? false,
    visibility: base.visibility ?? V.EXPANDED_DIRECT,
    layout: base.layout ?? L.STACKED,
    panel: base.panel ?? panelFor(fieldKey),
    bulkEdit: base.bulkEdit ?? false,
    inputConfig: base.inputConfig ?? null,
    statusButtonColor: base.statusButtonColor ?? null,
  }
}

const blockShapeTypeOptions = [
  { label: 'User', value: BLOCK_SHAPE_TYPES.USER },
  { label: 'Service', value: BLOCK_SHAPE_TYPES.SERVICE },
  { label: 'Time', value: BLOCK_SHAPE_TYPES.TIME },
  { label: 'Event', value: BLOCK_SHAPE_TYPES.EVENT },
  { label: 'Price', value: BLOCK_SHAPE_TYPES.PRICE },
]

const blockInstanceUserSemanticOptions = [
  { label: '—', value: null },
  ...USER_ROLE_VALUES.map((r) => ({
    label: r.length > 0 ? r.charAt(0).toUpperCase() + r.slice(1).replace(/_/g, ' ') : r,
    value: r,
  })),
]

const placementKindOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Marginal', value: 'marginal' },
  { label: 'Floating', value: 'floating' },
]

const anchorEdgeOptions = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
]

const eventVisibilityOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Confidential', value: 'confidential' },
]

const transparencyOptions = [
  { label: 'Opaque', value: 'opaque' },
  { label: 'Transparent', value: 'transparent' },
]

const sendUpdatesOptions = [
  { label: 'All', value: 'all' },
  { label: 'External only', value: 'externalOnly' },
  { label: 'None', value: 'none' },
]

const eventStatusOptions = [
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Tentative', value: 'tentative' },
]

const uiSlotOptions = [
  { label: '(None)', value: '' },
  ...ANNOTATION_UI_SLOT_REGISTRY.map((row) => ({ label: row.label, value: row.slot })),
]

function globalBlockShape(): Record<string, FieldMetadataEntry> {
  return {
    name: mk('name', DISPLAY_LABELS.NAME, 1, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    orderIndex: mk('orderIndex', 'Order index', 2, {
      dataType: 'number',
      renderAs: R.NUMBER,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    semanticType: mk('semanticType', 'App-wide Semantic Type', 3, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: blockShapeTypeOptions },
      panel: P.NONE,
    }),
    validBookingCascades: mk('validBookingCascades', 'Valid booking cascades', 10, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstBlockShapeSelectInputs.validBookingCascades },
    }),
    validPartCascades: mk('validPartCascades', 'Valid part shapes', 11, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstBlockShapeSelectInputs.validPartCascades },
    }),
    validAnnotationAssignments: mk('validAnnotationAssignments', 'Valid annotation shapes', 12, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstBlockShapeSelectInputs.validAnnotationAssignments },
    }),
    validEventCascades: mk('validEventCascades', 'Valid event shapes', 13, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstBlockShapeSelectInputs.validEventCascades },
    }),
  }
}

function globalPartShape(): Record<string, FieldMetadataEntry> {
  return {
    name: mk('name', DISPLAY_LABELS.NAME, 1, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    orderIndex: mk('orderIndex', 'Order index', 2, {
      dataType: 'number',
      renderAs: R.NUMBER,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    validPricingCascades: mk('validPricingCascades', 'Valid pricing cascades', 10, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstPartShapeSelectInputs.validPricingCascades },
    }),
  }
}

function globalBlockInstance(): Record<string, FieldMetadataEntry> {
  return {
    name: mk('name', DISPLAY_LABELS.NAME, 1, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    orderIndex: mk('orderIndex', 'Order index', 2, {
      dataType: 'number',
      renderAs: R.NUMBER,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    blockShapeRef: mk('blockShapeRef', 'Block shape', 4, {
      dataType: 'string',
      renderAs: R.REFERENCE,
      inputConfig: { ...codeFirstBlockInstanceSelectInputs.blockShapeRef },
      panel: P.NONE,
    }),
    baseSqFt: mk('baseSqFt', 'Base sq ft', 5, { dataType: 'number', renderAs: R.NUMBER, panel: P.NONE }),
    agentPermissions: mk('agentPermissions', 'Agent permissions', 6, {
      dataType: 'ternary',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    composite: mk('composite', 'Composite', 7, { dataType: 'boolean', renderAs: R.STATUS_BUTTON, panel: P.NONE }),
    orchestrator: mk('orchestrator', 'Orchestrator', 8, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      statusButtonColor: 'secondary',
      bulkEdit: true,
      panel: P.NONE,
    }),
    wizardVisible: mk('wizardVisible', 'Wizard visible', 9, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      statusButtonColor: 'secondary',
      bulkEdit: true,
      panel: P.NONE,
    }),
    icon: mk('icon', 'Icon', 10, { dataType: 'string', renderAs: R.ICON_SELECT, panel: P.NONE }),
    allowMultiple: mk('allowMultiple', 'Allow multiple', 11, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    requiresUnitNumber: mk('requiresUnitNumber', 'Requires unit number', 12, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    preClosing: mk('preClosing', 'Pre-closing', 13, { dataType: 'boolean', renderAs: R.STATUS_BUTTON, panel: P.NONE }),
    isMultiFamily: mk('isMultiFamily', 'Multi-family', 14, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    requiresAgent: mk('requiresAgent', 'Requires agent', 15, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    semanticType: mk('semanticType', 'App-wide Semantic Type', 16, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: blockInstanceUserSemanticOptions },
      panel: P.NONE,
    }),
    partAssignments: mk('partAssignments', 'Part assignments', 20, {
      dataType: 'array',
      renderAs: R.RELATIONSHIP_COLLECTION,
      inputConfig: { ...codeFirstBlockInstanceSelectInputs.partAssignments },
      panel: 'parts',
    }),
    annotationAssignments: mk('annotationAssignments', 'Annotation assignments', 21, {
      dataType: 'array',
      renderAs: R.RELATIONSHIP_COLLECTION,
      inputConfig: { ...codeFirstBlockInstanceSelectInputs.annotationAssignments },
      panel: FIELD_NAMES.ANNOTATIONS,
    }),
    bookingCascades: mk('bookingCascades', 'Booking cascades', 22, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstBlockInstanceSelectInputs.bookingCascades },
    }),
    eventAssignments: mk('eventAssignments', 'Event assignments', 23, {
      dataType: 'reference',
      renderAs: R.RELATIONSHIP_COLLECTION,
      visibility: V.EXPANDED_PANEL,
      inputConfig: { ...codeFirstBlockInstanceSelectInputs.eventAssignments },
      panel: 'events',
    }),
    instanceComponents: mk('instanceComponents', 'Instance components', 24, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstBlockInstanceSelectInputs.instanceComponents },
    }),
    dependentInstances: mk('dependentInstances', 'Dependent instances', 25, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstBlockInstanceSelectInputs.dependentInstances },
    }),
  }
}

function globalPartInstance(): Record<string, FieldMetadataEntry> {
  return {
    name: mk('name', DISPLAY_LABELS.NAME, 1, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    orderIndex: mk('orderIndex', 'Order index', 2, {
      dataType: 'number',
      renderAs: R.NUMBER,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    active: mk('active', 'Active', 3, { dataType: 'boolean', renderAs: R.STATUS_BUTTON, panel: P.NONE }),
    partShapeRef: mk('partShapeRef', 'Part shape', 4, {
      dataType: 'string',
      renderAs: R.REFERENCE,
      inputConfig: { ...codeFirstPartInstanceSelectInputs.partShapeRef },
      panel: P.NONE,
    }),
    baseTime: mk('baseTime', 'Base time', 5, { dataType: 'number', renderAs: R.NUMBER, panel: P.NONE }),
    timePerUnit: mk('timePerUnit', 'Time per unit', 6, {
      dataType: 'number',
      renderAs: R.NUMBER,
      panel: P.NONE,
    }),
    baseFee: mk('baseFee', 'Base fee', 7, { dataType: 'number', renderAs: R.NUMBER, panel: P.NONE }),
    feePerUnit: mk('feePerUnit', 'Fee per unit', 8, {
      dataType: 'number',
      renderAs: R.NUMBER,
      panel: P.NONE,
    }),
    zeroOutPart: mk('zeroOutPart', 'Zero out part', 9, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    pricingCascades: mk('pricingCascades', 'Pricing cascades', 10, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...codeFirstPartInstanceSelectInputs.pricingCascades },
    }),
    eventAssignments: mk('eventAssignments', 'Event assignments', 11, {
      dataType: 'reference',
      renderAs: R.RELATIONSHIP_COLLECTION,
      visibility: V.EXPANDED_PANEL,
      inputConfig: { ...PART_INSTANCE_EVENT_ASSIGNMENTS_INPUT_CONFIG },
      panel: 'events',
    }),
  }
}

function globalEventShape(): Record<string, FieldMetadataEntry> {
  return {
    name: mk('name', DISPLAY_LABELS.NAME, 1, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    orderIndex: mk('orderIndex', 'Order index', 2, {
      dataType: 'number',
      renderAs: R.NUMBER,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    placementKind: mk('placementKind', 'Placement kind', 3, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: placementKindOptions },
      panel: P.NONE,
    }),
    anchorEdge: mk('anchorEdge', 'Anchor edge', 4, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: anchorEdgeOptions },
      panel: P.NONE,
    }),
    active: mk('active', 'Active', 5, { dataType: 'boolean', renderAs: R.STATUS_BUTTON, panel: P.NONE }),
    attendeeAssignments: mk('attendeeAssignments', 'Attendees', 6, {
      dataType: 'array',
      renderAs: R.MULTISELECT,
      inputConfig: { ...EVENT_SHAPE_ATTENDEE_ASSIGNMENTS_INPUT_CONFIG },
      panel: 'events',
    }),
  }
}

function globalEventInstance(): Record<string, FieldMetadataEntry> {
  return {
    name: mk('name', DISPLAY_LABELS.NAME, 1, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    orderIndex: mk('orderIndex', 'Order index', 2, {
      dataType: 'number',
      renderAs: R.NUMBER,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    active: mk('active', 'Active', 3, { dataType: 'boolean', renderAs: R.STATUS_BUTTON, panel: P.NONE }),
    eventShapeRef: mk('eventShapeRef', 'Event shape ref', 4, {
      dataType: 'string',
      renderAs: R.TEXT,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    titleTemplate: mk('titleTemplate', 'Title template', 5, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    descriptionTemplate: mk('descriptionTemplate', 'Description template', 6, {
      dataType: 'string',
      renderAs: R.TEXT,
      panel: P.NONE,
    }),
    locationTemplate: mk('locationTemplate', 'Location template', 7, {
      dataType: 'string',
      renderAs: R.TEXT,
      panel: P.NONE,
    }),
    visibility: mk('visibility', 'Visibility', 8, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: eventVisibilityOptions },
      panel: P.NONE,
    }),
    transparency: mk('transparency', 'Transparency', 9, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: transparencyOptions },
      panel: P.NONE,
    }),
    guestsCanModify: mk('guestsCanModify', 'Guests can modify', 10, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    guestsCanInviteOthers: mk('guestsCanInviteOthers', 'Guests can invite others', 11, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    guestsCanSeeOtherGuests: mk('guestsCanSeeOtherGuests', 'Guests can see other guests', 12, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    addConferenceLink: mk('addConferenceLink', 'Add conference link', 13, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    sendUpdates: mk('sendUpdates', 'Send updates', 14, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: sendUpdatesOptions },
      panel: P.NONE,
    }),
    colorId: mk('colorId', 'Color', 15, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    status: mk('status', 'Status', 16, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: eventStatusOptions },
      panel: P.NONE,
    }),
    reminderOverrides: mk('reminderOverrides', 'Reminder overrides', 17, {
      dataType: 'array',
      renderAs: R.TEXT,
      panel: P.NONE,
    }),
    parentBlockInstanceId: mk('parentBlockInstanceId', 'Parent block instance', 18, {
      dataType: 'string',
      renderAs: R.TEXT,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    locationType: mk('locationType', 'Location type', 19, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    locationPlaceId: mk('locationPlaceId', 'Location place ID', 20, {
      dataType: 'string',
      renderAs: R.TEXT,
      panel: P.NONE,
    }),
    locationAddress: mk('locationAddress', 'Location address', 21, {
      dataType: 'string',
      renderAs: R.TEXT,
      panel: P.NONE,
    }),
    locationLat: mk('locationLat', 'Latitude', 22, { dataType: 'number', renderAs: R.NUMBER, panel: P.NONE }),
    locationLng: mk('locationLng', 'Longitude', 23, { dataType: 'number', renderAs: R.NUMBER, panel: P.NONE }),
    includeRescheduleLink: mk('includeRescheduleLink', 'Include reschedule link', 24, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    includeCancelLink: mk('includeCancelLink', 'Include cancel link', 25, {
      dataType: 'boolean',
      renderAs: R.STATUS_BUTTON,
      panel: P.NONE,
    }),
    scheduledBy: mk('scheduledBy', 'Scheduled by', 26, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
  }
}

function globalAnnotationShape(): Record<string, FieldMetadataEntry> {
  return {
    name: mk('name', DISPLAY_LABELS.NAME, 1, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    orderIndex: mk('orderIndex', 'Order index', 2, {
      dataType: 'number',
      renderAs: R.NUMBER,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    active: mk('active', 'Active', 3, { dataType: 'boolean', renderAs: R.STATUS_BUTTON, panel: P.NONE }),
    uiSlot: mk('uiSlot', 'Wizard UI slot', 4, {
      dataType: 'string',
      renderAs: R.SELECT,
      inputConfig: { options: uiSlotOptions },
      panel: P.NONE,
    }),
  }
}

function globalAnnotationInstance(): Record<string, FieldMetadataEntry> {
  return {
    name: mk('name', DISPLAY_LABELS.NAME, 1, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    orderIndex: mk('orderIndex', 'Order index', 2, {
      dataType: 'number',
      renderAs: R.NUMBER,
      visibility: V.HIDDEN,
      panel: P.NONE,
    }),
    active: mk('active', 'Active', 3, { dataType: 'boolean', renderAs: R.STATUS_BUTTON, panel: P.NONE }),
    type: mk('type', 'Annotation shape', 4, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    text: mk('text', 'Text', 5, { dataType: 'string', renderAs: R.TEXT, panel: P.NONE }),
    userTypeBlock: mk('userTypeBlock', 'User type block', 6, {
      dataType: 'string',
      renderAs: R.TEXT,
      panel: P.NONE,
    }),
    contentRows: mk('contentRows', 'Content rows', 7, { dataType: 'array', renderAs: R.TEXT, panel: P.NONE }),
  }
}

/**
 * Returns the full in-memory metadata graph used by admin FieldRenderer and cards.
 */
export function buildCodeFirstMetadataCache(): MetadataCache {
  return {
    global: {
      blockShape: globalBlockShape(),
      partShape: globalPartShape(),
      blockInstance: globalBlockInstance(),
      partInstance: globalPartInstance(),
      eventShape: globalEventShape(),
      eventInstance: globalEventInstance(),
      annotationShape: globalAnnotationShape(),
      annotationInstance: globalAnnotationInstance(),
    },
    blockShapeSpecific: {},
  }
}
