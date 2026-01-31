/**
 * LEARNING: Form Data Enums - Field type and mode enumerations
 * WHY: Type-safe field type definitions for form configuration
 * PATTERN: Enum definitions matching React structure
 */

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
  DependentInstanceSelect = "dependentInstanceSelect",
  BookingCascadeSelect = "bookingCascadeSelect",
  PartAssignmentSelect = "partAssignmentSelect",
  InstanceComponentSelect = "instanceComponentSelect",
  DescriptionSelect = "descriptionSelect", // LEARNING: Annotations are NOT in RELATIONSHIP_KEYS, handled specially (enum name kept for backward compatibility)
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

