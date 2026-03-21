
import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes';
import { FIELD_NAMES } from '../routes/internal/entities/entityConstants.js';

/** Panel value union used by FieldMetadataEntry and RelationshipMetadataEntry (matches models). */
export type AdminMetadataPanel =
  | 'none'
  | 'parts'
  | 'relationships'
  | typeof FIELD_NAMES.ANNOTATIONS;

/** Common display fields used when building primitive/relationship metadata payloads. */
export interface MetaDisplayFields {
  dataType: MetadataEntryBase['dataType'];
  label: string;
  isRequired: boolean;
  visibility: MetadataEntryBase['visibility'];
  layout: MetadataEntryBase['layout'];
  displayOrder: number;
  renderAs: MetadataEntryBase['renderAs'];
  statusButtonColor?: string | null;
  panel: MetadataEntryBase['panel'];
  bulkEdit: boolean;
  inputConfig?: Record<string, unknown> | null;
}

export type MetaPayload = Omit<MetaDisplayFields, 'inputConfig' | 'panel'> & {
  panel: AdminMetadataPanel;
  inputConfig: Record<string, unknown> | null;
};

export function mapMetaFieldsToPayload(meta: MetaDisplayFields): MetaPayload {
  return {
    dataType: meta.dataType,
    label: meta.label,
    isRequired: meta.isRequired,
    visibility: meta.visibility,
    layout: meta.layout,
    displayOrder: meta.displayOrder,
    renderAs: meta.renderAs,
    statusButtonColor: meta.statusButtonColor,
    panel: meta.panel as AdminMetadataPanel,
    bulkEdit: meta.bulkEdit,
    inputConfig: meta.inputConfig ?? null,
  };
}
