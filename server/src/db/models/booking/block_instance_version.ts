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
 * 
 * CRITICAL: No FK constraint on block_instance_id to allow instance deletion without losing versions
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
  
  /** Associated part instance versions (typed as Model[] to avoid circular type reference with PartInstanceVersion) */
  declare partInstanceVersions?: Model[];
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
