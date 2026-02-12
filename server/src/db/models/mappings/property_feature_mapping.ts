/**
 * Property Feature Mapping Model
 *
 * LEARNING: Maps RESO source features to block_instance suggestions
 * WHY: Admin-configurable feature-to-block mapping (Pool -> Pool block, etc.)
 * PATTERN: match_type (exists, contains, equals, greater_than)
 */

import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

export type FeatureMatchType = 'exists' | 'contains' | 'equals' | 'greater_than';

export class PropertyFeatureMapping extends Model<
  InferAttributes<PropertyFeatureMapping>,
  InferCreationAttributes<PropertyFeatureMapping>
> {
  declare id: CreationOptional<string>;
  declare dataSource: string;
  declare sourceField: string;
  declare matchType: FeatureMatchType;
  declare matchValue: string | null;
  declare blockInstanceId: ForeignKey<string>;
  declare active: boolean;
  declare priority: number;
  declare notes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function PropertyFeatureMappingFactory(sequelize: Sequelize) {
  PropertyFeatureMapping.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      dataSource: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'bright_mls',
        field: 'data_source',
      },
      sourceField: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'source_field',
      },
      matchType: {
        type: DataTypes.STRING(30),
        allowNull: false,
        field: 'match_type',
      },
      matchValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'match_value',
      },
      blockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_instance_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'property_feature_mapping',
      tableName: 'property_feature_mappings',
      freezeTableName: true,
    }
  );

  return PropertyFeatureMapping;
}
