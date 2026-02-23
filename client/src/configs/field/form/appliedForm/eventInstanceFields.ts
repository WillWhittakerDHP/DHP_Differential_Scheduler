
import { ENTITY_STATUS, FIELD_NAMES } from '@/constants/entityFieldConstants'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '@/types/entity/formDataEnums'

export const eventInstanceFields = {
  id: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "This Field Should Be Hidden",
    globalField: "id" as const,
    expandable: false,
  },

  name: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Enter event instance name",
    globalField: "name" as const,
    expandable: true, // Title field
  },

  eventShapeRef: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Select event shape",
    globalField: "eventShapeRef" as const,
    expandable: false,
  },

  titleTemplate: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.TextArea,
    placeholder: "Template for event title (e.g., '{service} on {propertyType}')",
    globalField: "titleTemplate" as const,
    expandable: false,
  },

  descriptionTemplate: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.TextArea,
    placeholder: "Template for event description (e.g., '{clientName} - {propertyAddress}')",
    globalField: "descriptionTemplate" as const,
    expandable: false,
  },

  locationTemplate: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.TextArea,
    placeholder: "Template for event location (e.g., '{propertyAddress}')",
    globalField: "locationTemplate" as const,
    expandable: false,
  },

  visibility: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Event visibility",
    globalField: "visibility" as const,
    expandable: false,
  },

  transparency: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Free or busy",
    globalField: "transparency" as const,
    expandable: false,
  },

  guestsCanModify: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Guests can modify",
    globalField: "guestsCanModify" as const,
    expandable: false,
  },

  guestsCanInviteOthers: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Guests can invite others",
    globalField: "guestsCanInviteOthers" as const,
    expandable: false,
  },

  guestsCanSeeOtherGuests: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Guests can see other guests",
    globalField: "guestsCanSeeOtherGuests" as const,
    expandable: false,
  },

  addConferenceLink: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Add Google Meet link",
    globalField: "addConferenceLink" as const,
    expandable: false,
  },

  sendUpdates: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Send email invitations",
    globalField: "sendUpdates" as const,
    expandable: false,
  },

  colorId: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Event color",
    globalField: "colorId" as const,
    expandable: false,
  },

  status: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Event status",
    globalField: "status" as const,
    expandable: false,
  },

  reminderOverrides: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Reminder overrides (JSON)",
    globalField: "reminderOverrides" as const,
    expandable: false,
  },

  orderIndex: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Hidden,
    placeholder: "This Field Should Be Hidden",
    globalField: FIELD_NAMES.ORDER_INDEX,
    expandable: false,
  },

  active: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: ENTITY_STATUS.ACTIVE,
    globalField: "active" as const,
    expandable: false,
  },
} as const;
