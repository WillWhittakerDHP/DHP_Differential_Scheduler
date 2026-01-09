/**
 * @deprecated This model is deprecated. Use the normalized structure instead:
 * - addresses: Address information
 * - property_versions: Links addresses to versioned property details
 * - property_details: Versioned property details from API or manual input
 * 
 * The properties table will be dropped in Phase 2 migration.
 * See: server/src/db/migrations/20260107_02_deprecate_properties_table.mjs
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

/**
 * @deprecated Use Address, PropertyVersion, and PropertyDetails models instead
 */
export class Property extends Model<
  InferAttributes<Property>,
  InferCreationAttributes<Property>
> {
  declare id: CreationOptional<string>;
  declare address: string;
  declare unit: string | null;
  declare city: string;
  declare state: string;
  declare zipCode: string;
  declare mlsNumber: string | null;
  declare squareFootage: number | null;
  declare bedrooms: number | null;
  declare bathrooms: number | null;
  declare foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
  declare additionalUnits: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function PropertyFactory(sequelize: Sequelize) {
  Property.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      zipCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'zip_code',
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
      modelName: 'property',
      tableName: 'properties',
      freezeTableName: true,
    }
  );

  return Property;
}

