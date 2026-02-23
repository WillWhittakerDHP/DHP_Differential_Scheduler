/**
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

export class AdminRelationshipMetadata extends Model<
  InferAttributes<AdminRelationshipMetadata>,
  InferCreationAttributes<AdminRelationshipMetadata>
> {
  declare id: CreationOptional<string>;
  declare entityType: 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance';
  declare entityId: string;
  declare relationshipKey: string;
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
  declare inputConfig: CreationOptional<Record<string, unknown> | null>;
  declare inheritsFromEntityType: CreationOptional<'blockShape' | 'partShape' | null>;
  declare inheritsFromEntityId: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function AdminRelationshipMetadataFactory(sequelize: Sequelize) {
  AdminRelationshipMetadata.init(
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
        comment: 'Entity type for this relationship metadata entry',
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'entity_id',
        comment: 'Entity ID or sentinel UUID for global configs',
      },
      relationshipKey: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'relationship_key',
        comment: 'Relationship name/key (e.g., partAssignments, validCascades)',
      },
      dataType: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'ternary', 'array', 'reference'),
        allowNull: false,
        field: 'data_type',
        comment: 'Relationship data type',
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
        comment: 'Whether relationship field is required',
      },
      visibility: {
        type: DataTypes.ENUM('titleRow', 'staticAsTitle', 'expandedDirect', 'expandedPanel', 'hidden', 'notConfigured'),
        allowNull: false,
        defaultValue: 'notConfigured',
        comment: 'Relationship field visibility setting',
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
        defaultValue: 999,
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
        defaultValue: 'reference',
        field: 'render_as',
        comment: 'How to render the relationship field (typically reference, or relationshipCollection for collection fields)',
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
        defaultValue: 'relationships',
        comment: 'Panel name for expandedPanel visibility (typically relationships)',
      },
      bulkEdit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'bulk_edit',
        comment: 'Whether relationship field can be bulk edited',
      },
      inputConfig: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'input_config',
        comment: 'Input configuration for relationship fields (selectMode, groupByKey, etc.)',
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
          fields: ['entity_type', 'entity_id', 'relationship_key'],
          name: 'admin_relationship_metadata_entity_relationship_unique',
        },
        {
          fields: ['entity_type', 'entity_id'],
          name: 'admin_relationship_metadata_entity_idx',
        },
        {
          fields: ['relationship_key'],
          name: 'admin_relationship_metadata_relationship_key_idx',
        },
        {
          fields: ['inherits_from_entity_type', 'inherits_from_entity_id'],
          name: 'admin_relationship_metadata_inheritance_idx',
        },
      ],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'admin_relationship_metadata',
      tableName: 'admin_relationship_metadata',
      freezeTableName: true,
    }
  );

  return AdminRelationshipMetadata;
}
