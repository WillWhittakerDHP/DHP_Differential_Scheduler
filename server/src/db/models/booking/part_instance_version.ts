import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';


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
  declare feePerUnit: number;
  declare timePerUnit: number;
  declare baseMultiplier: number;
  declare rateMultiplier: number;
  declare createdAt: CreationOptional<Date>;
  
  /** Associated block instance version (typed as Model | null to avoid circular type reference with BlockInstanceVersion) */
  declare blockInstanceVersion?: Model | null;
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
      feePerUnit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'fee_per_unit',
      },
      timePerUnit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'time_per_unit',
      },
      baseMultiplier: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
        field: 'base_multiplier',
      },
      rateMultiplier: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
        field: 'rate_multiplier',
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
