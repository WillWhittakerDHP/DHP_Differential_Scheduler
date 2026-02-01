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
 * PartInstanceVersion Model
 * 
 * LEARNING: Immutable version records for part instances
 * WHY: Preserves historical part instance data as children of block instance versions
 * PATTERN: Part instances are versioned only when parent block instance is versioned (lazy cascade)
 * 
 * CRITICAL: FK to block_instance_versions (not block_instances) - part versions belong to block versions
 * WHY: Part instances are children of blocks in snapshot structure
 */
export class PartInstanceVersion extends Model<
  InferAttributes<PartInstanceVersion>,
  InferCreationAttributes<PartInstanceVersion>
> {
  declare id: CreationOptional<string>;
  declare blockInstanceVersionId: ForeignKey<string>;
  declare partInstanceId: string; // NO FK constraint - allows deletion
  declare name: string | null;
  declare baseFee: number;
  declare baseTime: number;
  declare rateOverBaseFee: number;
  declare rateOverBaseTime: number;
  declare createdAt: CreationOptional<Date>;
  
  declare blockInstanceVersion?: any; // BlockInstanceVersion
}

export function PartInstanceVersionFactory(sequelize: Sequelize) {
  PartInstanceVersion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      blockInstanceVersionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_instance_version_id',
        references: {
          model: 'block_instance_versions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      partInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'part_instance_id',
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      baseFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'base_fee',
      },
      baseTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'base_time',
      },
      rateOverBaseFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rate_over_base_fee',
      },
      rateOverBaseTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rate_over_base_time',
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
      modelName: 'part_instance_version',
      tableName: 'part_instance_versions',
      freezeTableName: true,
      indexes: [
        {
          fields: ['block_instance_version_id'],
        },
        {
          fields: ['part_instance_id'],
        },
        {
          unique: true,
          fields: ['block_instance_version_id', 'part_instance_id'],
        },
      ],
    }
  );

  return PartInstanceVersion;
}
