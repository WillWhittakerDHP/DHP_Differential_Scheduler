import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

/**
 * PropertyVersion Model
 * 
 * LEARNING: PropertyVersion links addresses to versioned property details
 * WHY: Name clearly indicates versioning purpose, prepares for future versioning logic in MLS API phase
 * PATTERN: Minimal structure (versioning logic implemented later), foreign key to Address
 */
export class PropertyVersion extends Model<
  InferAttributes<PropertyVersion>,
  InferCreationAttributes<PropertyVersion>
> {
  declare id: CreationOptional<string>;
  declare addressId: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function PropertyVersionFactory(sequelize: Sequelize) {
  PropertyVersion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      addressId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'address_id',
        references: {
          model: 'addresses',
          key: 'id',
        },
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
      modelName: 'propertyVersion',
      tableName: 'property_versions',
      freezeTableName: true,
    }
  );

  return PropertyVersion;
}

