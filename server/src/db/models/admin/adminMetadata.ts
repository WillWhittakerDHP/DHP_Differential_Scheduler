/**
 * WHY: Single model for both primitive and relationship metadata (follows entit...
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
import { FIELD_NAMES } from '../../../routes/internal/entities/entityConstants.js';

export class AdminMetadata extends Model<
  InferAttributes<AdminMetadata>,
  InferCreationAttributes<AdminMetadata>
> {
  declare id: CreationOptional<string>;
  declare metadataType: 'primitive' | 'relationship';
  declare entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance';
  declare entityId: string; // Entity ID or sentinel UUID for global configs
  declare fieldKey: string; // Unified - replaces both fieldKey and relationshipKey
  declare blockShapeRef: CreationOptional<string | null>; // BlockShape ID for BlockShape-specific instance metadata
  declare dataType: 'string' | 'number' | 'boolean' | 'ternary' | 'array' | 'reference';
  declare label: string;
  declare isRequired: boolean;
  declare visibility: 'titleRow' | 'staticAsTitle' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured';
  declare layout: 'inline' | 'stacked';
  declare displayOrder: number;
  declare renderAs: 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect' | 'relationshipCollection';
  declare statusButtonColor: CreationOptional<string | null>;
  declare panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS;
  declare bulkEdit: boolean;
  declare inputConfig: CreationOptional<Record<string, unknown> | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function AdminMetadataFactory(sequelize: Sequelize) {
  AdminMetadata.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      metadataType: {
        type: DataTypes.ENUM('primitive', 'relationship'),
        allowNull: false,
        field: 'metadata_type',
        comment: 'Discriminator: primitive or relationship metadata',
      },
      entityType: {
        type: DataTypes.ENUM('blockShape', 'partShape', 'blockInstance', 'partInstance', 'eventShape', 'eventInstance', 'annotationShape', 'annotationInstance'),
        allowNull: false,
        field: 'entity_type',
        comment: 'Entity type for this metadata entry',
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'entity_id',
        comment: 'Entity ID or sentinel UUID for global configs',
      },
      fieldKey: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'field_key',
        comment: 'Field name/key (unified - replaces both field_key and relationship_key)',
      },
      blockShapeRef: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'block_shape_ref',
        comment: 'BlockShape ID for BlockShape-specific instance metadata (NULL = global config)',
      },
      dataType: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'ternary', 'array', 'reference'),
        allowNull: false,
        field: 'data_type',
        comment: 'Field data type',
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Human-readable label',
      },
      isRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_required',
        comment: 'Whether field is required',
      },
      visibility: {
        type: DataTypes.ENUM('titleRow', 'staticAsTitle', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'),
        allowNull: false,
        defaultValue: 'notConfigured',
        comment: 'Field visibility setting',
      },
      layout: {
        type: DataTypes.ENUM('inline', 'stacked'),
        allowNull: false,
        defaultValue: 'stacked',
        comment: 'Layout within section',
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 999, // High number = "not configured" (appears last)
        field: 'display_order',
        comment: 'Display order (lower = first). 999 = not configured.',
      },
      renderAs: {
        type: DataTypes.ENUM('text', 'number', 'select', 'multiselect', 'reference', 'statusButton', 'iconSelect', 'relationshipCollection'),
        allowNull: false,
        defaultValue: 'text',
        field: 'render_as',
        comment: 'How to render the field (relationshipCollection is the generic collection type)',
      },
      statusButtonColor: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'status_button_color',
        comment: 'Color for statusButton rendering (Vuetify color name)',
      },
      panel: {
        type: DataTypes.ENUM('none', 'parts', 'relationships', FIELD_NAMES.ANNOTATIONS, 'events'),
        allowNull: false,
        defaultValue: 'none',
        comment: 'Panel name for expandedPanel visibility',
      },
      bulkEdit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'bulk_edit',
        comment: 'Whether field can be bulk edited',
      },
      inputConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'input_config',
        comment: 'Input configuration for select/multiselect/reference/relationshipCollection fields',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    },
    {
      sequelize,
      indexes: [
        // Note: Unique constraints and indexes are created in migrations
        // See migration 20260131130300_drop_config_columns.mjs
        // These are regular indexes for query performance
        {
          fields: ['entity_type', 'entity_id'],
          name: 'admin_metadata_entity_idx',
        },
        {
          fields: ['field_key'],
          name: 'admin_metadata_field_key_idx',
        },
        {
          fields: ['metadata_type'],
          name: 'admin_metadata_metadata_type_idx',
        },
        {
          fields: ['entity_type', 'block_shape_ref', 'field_key'],
          name: 'admin_metadata_blockshape_ref_idx',
        },
      ],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'admin_metadata',
      tableName: 'admin_metadata',
      freezeTableName: true,
    }
  );

  return AdminMetadata;
}
