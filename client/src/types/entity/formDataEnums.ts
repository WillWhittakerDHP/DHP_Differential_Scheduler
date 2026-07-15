
export enum FieldTypeEnum {
  Primitive = 'primitive',
  Select = 'select',
}

export enum FieldModeEnum {
  Primitive = 'primitive',
  RelationshipSelect = 'relationship',
  TypeSelect = 'type',
}

export enum PrimitiveTypeEnum {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  Virtual = 'virtual',
}

export enum PrimitiveModeEnum {
  Hidden = 'hidden',
  Input = 'input',
  TextArea = 'textarea',
  TextEditOnExpand = 'textEditOnExpand',
  MultilineText = 'multilineText',
  Number = 'number',
  Toggle = 'toggle',
  Select = 'select',
  Checkbox = 'checkbox',
  ModeToggle = 'modeToggle',
}

export enum RelationshipSelectTypeEnum {
  BlockShapeSelect = 'blockShapeSelect',
  PartShapeSelect = 'partShapeSelect',
  ValidBookingCascadeSelect = 'validBookingCascadeSelect',
  ValidPartCascadeSelect = 'validPartCascadeSelect',
  ValidAnnotationAssignmentSelect = 'validAnnotationAssignmentSelect',
  ValidEventCascadeSelect = 'validEventCascadeSelect',
  BookingCascadeSelect = 'bookingCascadeSelect',
  PricingCascadeSelect = 'pricingCascadeSelect',
  ValidPricingCascadeSelect = 'validPricingCascadeSelect',
  PartAssignmentSelect = 'partAssignmentSelect',
  InstanceComponentSelect = 'instanceComponentSelect',
  AccumulationLinkSelect = 'accumulationLinkSelect',
  EventAssignmentSelect = 'eventAssignmentSelect',
  AnnotationAssignmentSelect = 'annotationAssignmentSelect',
}

export enum RelationshipSelectModeEnum {
  Hidden = 'hidden',
  Single = 'single',
  Multiple = 'multiple',
  Required = 'required',
  Nested = 'nested',
}

export enum TypeSelectEnum {
  Virtual = 'virtual',
  BlockShape = 'blockShape',
  PartShape = 'partShape',
}
