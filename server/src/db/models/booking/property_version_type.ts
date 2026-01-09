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
 * PropertyVersionType Model
 * 
 * Junction table linking property_versions to block_instances (property types).
 * Enables properties to have multiple associated types from the "Properties" block_shape.
 * 
 * LEARNING: Property types are stored as block_instances with "Properties" block_shape
 * WHY: Consistent pattern with services, dwelling adjustments, and other block_instance types
 * PATTERN: Junction table with database-level validation via trigger
 * 
 * Constraint: block_instance_id must reference a block_instance with "Properties" block_shape
 * This is enforced at both database level (trigger) and application level (API validation).
 */
export class PropertyVersionType extends Model<
  InferAttributes<PropertyVersionType>,
  InferCreationAttributes<PropertyVersionType>
> {
  declare id: CreationOptional<string>;
  declare propertyVersionId: ForeignKey<string>;
  declare blockInstanceId: ForeignKey<string>;
  declare orderIndex: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function PropertyVersionTypeFactory(sequelize: Sequelize) {
  PropertyVersionType.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      propertyVersionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'property_version_id',
        references: {
          model: 'property_versions',
          key: 'id',
        },
      },
      blockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_instance_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
        comment: 'Must reference a block_instance with "Properties" block_shape (enforced by trigger)',
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'order_index',
        comment: 'Order in which property types should be displayed',
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
      modelName: 'property_version_type',
      tableName: 'property_version_types',
      indexes: [
        {
          unique: true,
          fields: ['property_version_id', 'block_instance_id'],
        },
      ],
      freezeTableName: true,
    }
  );

  return PropertyVersionType;
}

