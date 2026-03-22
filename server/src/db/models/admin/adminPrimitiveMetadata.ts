
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
import { FIELD_NAMES } from '../../../routes/internal/entities/entityConstants.js';

export class AdminPrimitiveMetadata extends Model<
  InferAttributes<AdminPrimitiveMetadata>,
  InferCreationAttributes<AdminPrimitiveMetadata>
> {
  declare id: CreationOptional<string>;
  declare entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance';
  declare entityId: string;
  declare fieldKey: string;
  declare dataType: 'string' | 'number' | 'boolean' | 'ternary' | 'array' | 'reference';
  declare label: string;
  declare isRequired: boolean;
  declare visibility: 'titleRow' | 'staticAsTitle' | 'expandedDirect' | 'expandedPanel' | 'hidden' | 'notConfigured';
  declare layout: 'inline' | 'stacked';
  declare displayOrder: number;
  declare section: CreationOptional<string | null>;
  declare renderAs: 'text' | 'number' | 'select' | 'multiselect' | 'reference' | 'statusButton' | 'iconSelect' | 'relationshipCollection';
  declare statusButtonColor: CreationOptional<string | null>;
  declare panel: 'none' | 'parts' | 'relationships' | typeof FIELD_NAMES.ANNOTATIONS;
  declare bulkEdit: boolean;
  /** Normalized input config (API still uses composed inputConfig). */
  declare icTargetMode: CreationOptional<string | null>;
  declare icSelectMode: CreationOptional<string | null>;
  declare icSelectType: CreationOptional<string | null>;
  declare icTargetKey: CreationOptional<string | null>;
  declare icGlobalField: CreationOptional<string | null>;
  declare icPlaceholder: CreationOptional<string | null>;
  declare icGroupByKey: CreationOptional<string | null>;
  declare icSelectedChildKey: CreationOptional<string | null>;
  declare icCandidateChildKey: CreationOptional<string | null>;
  declare icSelectedParentKey: CreationOptional<string | null>;
  declare icCandidateParentKey: CreationOptional<string | null>;
  declare icSelectedChildPath: CreationOptional<string[] | null>;
  declare icCandidateChildPath: CreationOptional<string[] | null>;
  declare icCandidateParentPath: CreationOptional<string[] | null>;
  declare inheritsFromEntityType: CreationOptional<'blockShape' | 'partShape' | null>;
  declare inheritsFromEntityId: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function AdminPrimitiveMetadataFactory(sequelize: Sequelize) {
  AdminPrimitiveMetadata.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      entityType: {
        type: DataTypes.ENUM('blockShape', 'partShape', 'blockInstance', 'partInstance'),
        allowNull: false,
        field: 'entity_type',
        comment: 'Entity type for this primitive metadata entry',
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
        comment: 'Primitive field name/key (e.g., name, active, composable)',
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
      section: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Optional section/group name',
      },
      renderAs: {
        type: DataTypes.ENUM('text', 'number', 'select', 'multiselect', 'reference', 'statusButton', 'iconSelect', 'relationshipCollection'),
        allowNull: false,
        defaultValue: 'text',
        field: 'render_as',
        comment: 'How to render the field (control type + statusButton + iconSelect + relationshipCollection)',
      },
      statusButtonColor: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'status_button_color',
        comment: 'Color for statusButton rendering (Vuetify color name)',
      },
      panel: {
        type: DataTypes.ENUM('none', 'parts', 'relationships', FIELD_NAMES.ANNOTATIONS),
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
      icTargetMode: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: 'ic_target_mode',
      },
      icSelectMode: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: 'ic_select_mode',
      },
      icSelectType: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'ic_select_type',
      },
      icTargetKey: {
        type: DataTypes.STRING(128),
        allowNull: true,
        field: 'ic_target_key',
      },
      icGlobalField: {
        type: DataTypes.STRING(128),
        allowNull: true,
        field: 'ic_global_field',
      },
      icPlaceholder: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ic_placeholder',
      },
      icGroupByKey: {
        type: DataTypes.STRING(128),
        allowNull: true,
        field: 'ic_group_by_key',
      },
      icSelectedChildKey: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'ic_selected_child_key',
      },
      icCandidateChildKey: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'ic_candidate_child_key',
      },
      icSelectedParentKey: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'ic_selected_parent_key',
      },
      icCandidateParentKey: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'ic_candidate_parent_key',
      },
      icSelectedChildPath: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        field: 'ic_selected_child_path',
      },
      icCandidateChildPath: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        field: 'ic_candidate_child_path',
      },
      icCandidateParentPath: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        field: 'ic_candidate_parent_path',
      },
      inheritsFromEntityType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'inherits_from_entity_type',
        comment: 'For instances: parent entity type (blockShape or partShape)',
      },
      inheritsFromEntityId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'inherits_from_entity_id',
        comment: 'For instances: parent entity ID (shape ID)',
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
        {
          unique: true,
          fields: ['entity_type', 'entity_id', 'field_key'],
          name: 'admin_primitive_metadata_entity_field_unique',
        },
        {
          fields: ['entity_type', 'entity_id'],
          name: 'admin_primitive_metadata_entity_idx',
        },
        {
          fields: ['field_key'],
          name: 'admin_primitive_metadata_field_key_idx',
        },
        {
          fields: ['inherits_from_entity_type', 'inherits_from_entity_id'],
          name: 'admin_primitive_metadata_inheritance_idx',
        },
      ],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'admin_primitive_metadata',
      tableName: 'admin_primitive_metadata',
      freezeTableName: true,
    }
  );

  return AdminPrimitiveMetadata;
}
