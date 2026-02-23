
enum FieldTypeEnum { 
  Primitive = "primitive",
  Select = "select"
}  

enum FieldModeEnum {
  Primitive = "primitive",
  RelationshipSelect = "relationship",
  TypeSelect = "type"
}  
  
enum PrimitiveTypeEnum {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Date = "date",
  Virtual = "virtual",
}

enum PrimitiveModeEnum { 
  Hidden = "hidden",
  Input = "input",
  TextArea = "textarea",
  TextEditOnExpand = "textEditOnExpand",
  MultilineText = "multilineText",
  Number = "number", 
  Toggle = "toggle",   
  Select = "select",
  Checkbox = "checkbox",
  ModeToggle = "modeToggle",
}  

enum RelationshipSelectTypeEnum {
  BlockShapeSelect = "blockShapeSelect",
  PartShapeSelect = "partShapeSelect",
  ValidCascadeSelect = "validCascadeSelect",
  ValidPartSelect = "validPartSelect",
  ValidEventSelect = "validEventSelect",
  DependentInstanceSelect = "dependentInstanceSelect",
  BookingCascadeSelect = "bookingCascadeSelect",
  PricingCascadeSelect = "pricingCascadeSelect",
  ValidPricingCascadeSelect = "validPricingCascadeSelect",
  PartAssignmentSelect = "partAssignmentSelect",
  InstanceComponentSelect = "instanceComponentSelect",
  EventAssignmentSelect = "eventAssignmentSelect",
  AnnotationAssignmentSelect = "annotationAssignmentSelect", // LEARNING: Annotations are now core entities, use standard relationship select pattern
}

enum RelationshipSelectModeEnum {
  Hidden = "hidden",
  Single = "single",
  Multiple = "multiple",  
  Required = "required",
  Nested = "nested"
}

enum TypeSelectEnum {
  Virtual = "virtual",
  BlockShape = "blockShape",
  PartShape = "partShape",
}

export {
  FieldTypeEnum,
  FieldModeEnum, 
  PrimitiveTypeEnum,
  PrimitiveModeEnum,
  RelationshipSelectTypeEnum,
  RelationshipSelectModeEnum,
  TypeSelectEnum,
}

