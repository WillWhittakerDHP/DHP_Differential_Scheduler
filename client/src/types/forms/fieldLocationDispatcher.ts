import type { SubPanelKey } from '@/constants/fieldMetadata'

export type FieldLocation =
  | { type: 'titleRow'; reason: 'titleRow' | 'staticAsTitle' }
  | { type: 'directInline'; reason: 'expandedDirect' }
  | { type: 'directStacked'; reason: 'expandedDirect' }
  | { type: 'subPanel'; panel: SubPanelKey; reason: 'expandedPanel' }
  | { type: 'hidden'; reason: 'hidden' | 'notConfigured' | 'notExpanded' }

export interface FieldLocationContext {
  isExpanded: boolean
}
