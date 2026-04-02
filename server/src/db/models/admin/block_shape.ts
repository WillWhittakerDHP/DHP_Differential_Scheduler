import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

import { FIELD_NAMES } from '../../../routes/internal/entities/entityConstants.js';
import { ValidPartCascade } from './valid_part_cascade';
import { ValidBookingCascade } from './valid_booking_cascade';
import { ValidEventCascade } from './valid_event_cascade';
import { ValidAnnotationAssignment } from './valid_annotation_assignment';

export class BlockShape extends Model<
  InferAttributes<BlockShape>,
  InferCreationAttributes<BlockShape>
> {
  declare id: CreationOptional<string>;
  declare orderIndex: CreationOptional<number>;
  declare name: string;
  declare type: 'user' | 'service' | 'time' | 'event' | 'price';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare validPartCascades?: ValidPartCascade[];
  declare validBookingCascades?: ValidBookingCascade[];
  declare default_parts?: ValidPartCascade[];
  declare validEventCascades?: ValidEventCascade[];
  declare validAnnotationAssignments?: ValidAnnotationAssignment[];
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
        type: DataTypes.ENUM('user', 'service', 'time', 'event', 'price'),
        allowNull: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
          fields: [FIELD_NAMES.ORDER_INDEX],
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
