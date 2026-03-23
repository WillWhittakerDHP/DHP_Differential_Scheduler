import type { MetadataEntryBase } from '@shared/types/metadataEntryTypes'
import { nilToEmptyArray } from '@shared/utils/nilDefaults.js'
import { FIELD_NAMES } from '../routes/internal/entities/entityConstants.js'
import { decodeInputConfig, icColumnsFromModel } from './adminMetadataInputConfigCodec.js'

/** Panel value union used by FieldMetadataEntry and RelationshipMetadataEntry (matches models). */
type AdminMetadataPanel =
  | 'none'
  | 'parts'
  | 'relationships'
  | typeof FIELD_NAMES.ANNOTATIONS;

/** Common display fields used when building primitive/relationship metadata payloads. */
interface MetaDisplayFields {
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

type MetaPayload = Omit<MetaDisplayFields, 'inputConfig' | 'panel'> & {
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
  }
}

/** Model row shape for ic_* columns + display fields (primitive/relationship metadata composers). */
type AdminMetaRowForComposerPayload = Omit<MetaDisplayFields, 'inputConfig'> &
  Parameters<typeof icColumnsFromModel>[0]

/**
 * Shared primitive/relationship path: map display fields + decode inputConfig from ic columns and select options.
 */
export function mapMetaFieldsToPayloadWithDecodedInput(
  meta: AdminMetaRowForComposerPayload,
  optionRows: ReadonlyArray<{ displayOrder: number; label: string; valuePayload: string | null }> | undefined
): MetaPayload {
  return mapMetaFieldsToPayload({
    dataType: meta.dataType,
    label: meta.label,
    isRequired: meta.isRequired,
    visibility: meta.visibility,
    layout: meta.layout,
    displayOrder: meta.displayOrder,
    renderAs: meta.renderAs,
    statusButtonColor: meta.statusButtonColor ?? undefined,
    panel: meta.panel,
    bulkEdit: meta.bulkEdit,
    inputConfig: decodeInputConfig(icColumnsFromModel(meta), nilToEmptyArray(optionRows)),
  })
}
