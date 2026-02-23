import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';
import { DEFAULT_VALUES } from '../../../routes/internal/properties/propertyConstants.js';

/**
 * PATTERN: PropertyDetails Model

PATTERN: Versioned data structure with source tra...
 */
export class PropertyDetails extends Model<
  InferAttributes<PropertyDetails>,
  InferCreationAttributes<PropertyDetails>
> {
  declare id: CreationOptional<string>;
  declare propertyVersionId: ForeignKey<string>;
  declare source: 'api' | 'manual' | typeof DEFAULT_VALUES.SOURCE;
  declare mlsNumber: string | null;
  declare squareFootage: number | null;
  declare bedrooms: number | null;
  declare bathrooms: number | null;
  declare foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
  declare additionalUnits: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function PropertyDetailsFactory(sequelize: Sequelize) {
  PropertyDetails.init(
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
      source: {
        type: DataTypes.ENUM('api', 'manual', DEFAULT_VALUES.SOURCE),
        allowNull: false,
        defaultValue: DEFAULT_VALUES.SOURCE,
      },
      mlsNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'mls_number',
      },
      squareFootage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'square_footage',
      },
      bedrooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bathrooms: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      foundationAccess: {
        type: DataTypes.ENUM('basement', 'crawlspace', 'slab'),
        allowNull: true,
        field: 'foundation_access',
      },
      additionalUnits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'additional_units',
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
      modelName: 'propertyDetails',
      tableName: 'property_details',
      freezeTableName: true,
    }
  );

  return PropertyDetails;
}

