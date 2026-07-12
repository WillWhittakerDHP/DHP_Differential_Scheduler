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
  declare composite: boolean;
  declare orchestrator: boolean;
  declare wizardVisible: boolean;
  declare preClosing: boolean;
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
      composite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      orchestrator: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      wizardVisible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'wizard_visible',
      },
      preClosing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'pre_closing',
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
