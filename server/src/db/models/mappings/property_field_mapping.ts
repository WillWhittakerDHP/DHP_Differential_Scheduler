/**
 * Property Field Mapping Model
 *
 */

import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

export class PropertyFieldMapping extends Model<
  InferAttributes<PropertyFieldMapping>,
  InferCreationAttributes<PropertyFieldMapping>
> {
  declare id: CreationOptional<string>;
  declare dataSource: string;
  declare sourceField: string;
  declare targetField: string;
  declare valueMapping: Record<string, unknown> | null;
  declare fallbackValue: string | null;
  declare active: boolean;
  declare notes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function PropertyFieldMappingFactory(sequelize: Sequelize) {
  PropertyFieldMapping.init(
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
      targetField: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'target_field',
      },
      valueMapping: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'value_mapping',
      },
      fallbackValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'fallback_value',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      modelName: 'property_field_mapping',
      tableName: 'property_field_mappings',
      freezeTableName: true,
    }
  );

  return PropertyFieldMapping;
}
