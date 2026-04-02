/**
 * Field component types with reasons (which component renders the field).
 */
export type FieldComponent =
  | { type: 'icon'; reason: 'iconSelect' }
  | { type: 'primitive'; reason: 'text' | 'number' | 'statusButton' }
  | { type: 'relationshipCollection'; reason: 'relationshipCollection' }
  | { type: 'select'; reason: 'select' | 'multiselect' | 'reference' }
  | { type: 'unknown'; reason: 'notConfigured' | 'invalidRenderAs' }
