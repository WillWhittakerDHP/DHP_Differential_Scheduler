import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

import { ValidPart } from './valid_part';
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
  declare canHaveParts: boolean;
  declare isStateControl: boolean; // If true, acts as state selector in wizard (mutually exclusive with canHaveParts)
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare valid_parts?: ValidPart[];
  declare valid_cascades?: ValidCascade[];
  declare default_parts?: ValidPart[];
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
      canHaveParts: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'can_have_parts', // Map to snake_case database column
      },
      isStateControl: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_state_control', // Map to snake_case database column
        comment: 'If true, acts as state selector in wizard (mutually exclusive with canHaveParts)',
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
      validate: {
        // Validate mutual exclusivity: isStateControl and canHaveParts cannot both be true
        stateControlMutualExclusivity() {
          if (this.isStateControl === true && this.canHaveParts === true) {
            throw new Error('isStateControl and canHaveParts cannot both be true. They are mutually exclusive.');
          }
        },
      },
    }
  );

  return BlockShape;
}
