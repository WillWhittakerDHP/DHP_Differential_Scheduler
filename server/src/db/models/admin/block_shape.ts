import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

import { ValidConstituent } from './valid_constituent';
import { ValidCascade } from './valid_cascade';

export class BlockShape extends Model<
  InferAttributes<BlockShape>,
  InferCreationAttributes<BlockShape>
> {
  declare id: CreationOptional<string>;
  declare orderIndex: CreationOptional<number>;
  declare name: string;
  declare type: 'user' | 'service' | 'property' | 'option';
  declare composable: boolean;
  declare constituable: boolean;
  declare active: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // ✅ Add valid children types
  declare valid_constituents?: ValidConstituent[];
  declare valid_cascades?: ValidCascade[];
  declare default_constituents?: ValidConstituent[];
}

export function BlockShapeFactory(sequelize: Sequelize) {
  BlockShape.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM('user', 'service', 'property', 'option'),
        allowNull: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      composable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      constituable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      indexes: [
        {
          fields: ['orderIndex'],
        },
      ],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'block_shape',
      tableName: 'block_shapes',
      freezeTableName: true,
    }
  );

  return BlockShape;
}
