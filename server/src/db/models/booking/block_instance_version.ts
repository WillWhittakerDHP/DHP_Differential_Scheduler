import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

/**
 * BlockInstanceVersion Model
 * 
 * LEARNING: Immutable version records for block instances
 * WHY: Preserves historical block instance data when referenced by appointments
 * PATTERN: Temporal/tuple versioning - stores immutable snapshots of block instances
 * 
 * CRITICAL: No FK constraint on block_instance_id to allow instance deletion without losing versions
 * WHY: Admins can delete instances freely while preserving historical data for appointments
 */
export class BlockInstanceVersion extends Model<
  InferAttributes<BlockInstanceVersion>,
  InferCreationAttributes<BlockInstanceVersion>
> {
  declare id: CreationOptional<string>;
  declare blockInstanceId: string; // NO FK constraint - allows deletion
  declare name: string;
  declare icon: string | null;
  declare baseSqFt: number | null;
  declare allowMultiple: boolean;
  declare differential: 'true' | 'false' | 'override';
  declare createdAt: CreationOptional<Date>;
  
  // Relationships
  declare partInstanceVersions?: any[]; // PartInstanceVersion[]
}

export function BlockInstanceVersionFactory(sequelize: Sequelize) {
  BlockInstanceVersion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      blockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_instance_id',
        // NO references - allows instance deletion while preserving history
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      baseSqFt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'base_sq_ft',
      },
      allowMultiple: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'allow_multiple',
      },
      differential: {
        type: DataTypes.ENUM('true', 'false', 'override'),
        allowNull: false,
        defaultValue: 'false',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'block_instance_version',
      tableName: 'block_instance_versions',
      freezeTableName: true,
      indexes: [
        {
          fields: ['block_instance_id'],
        },
        {
          fields: ['created_at'],
        },
        {
          unique: true,
          fields: ['block_instance_id', 'created_at'],
        },
      ],
    }
  );

  return BlockInstanceVersion;
}
