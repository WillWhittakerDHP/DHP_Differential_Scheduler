/**
 * WHY: Keeps AdminPrimitiveMetadataEditor.vue under vue-architecture script line limit.
 */
import { FIELD_LAYOUT } from '@/constants/fieldMetadata'

export const ADMIN_METADATA_VISIBILITY_OPTIONS = [
  { title: 'Not Configured', value: 'notConfigured' },
  { title: 'Title Row', value: 'titleRow' },
  { title: 'Static As Title', value: 'staticAsTitle' },
  { title: 'Expanded Direct', value: 'expandedDirect' },
  { title: 'Expanded Panel', value: 'expandedPanel' },
  { title: 'Hidden', value: 'hidden' },
] as const

export const ADMIN_METADATA_LAYOUT_OPTIONS = [
  { title: 'Inline', value: FIELD_LAYOUT.INLINE },
  { title: 'Stacked', value: FIELD_LAYOUT.STACKED },
] as const

export const ADMIN_METADATA_COLOR_OPTIONS = [
  { title: 'Red', value: 'error' },
  { title: 'Orange', value: 'secondary' },
  { title: 'Yellow', value: 'yellow' },
  { title: 'Green', value: 'success' },
  { title: 'Blue', value: 'info' },
  { title: 'Indigo', value: 'primary' },
  { title: 'Violet', value: 'purple' },
  { title: 'Grey', value: 'grey' },
  { title: 'Brown', value: 'brown' },
] as const

export const ADMIN_METADATA_SELECT_MODE_OPTIONS = [
  { title: 'Single', value: 'Single' },
  { title: 'Multiple', value: 'Multiple' },
  { title: 'Required', value: 'Required' },
  { title: 'Nested', value: 'Nested' },
] as const
