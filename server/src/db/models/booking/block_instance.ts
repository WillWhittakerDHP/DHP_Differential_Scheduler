import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import { DEFAULT_VALUES, FIELD_NAMES } from '../../../routes/internal/entities/entityConstants.js';
import { PartAssignment } from './part_assignment';
import { BookingCascade } from './booking_cascade';

export class BlockInstance extends Model<
  InferAttributes<BlockInstance>,
  InferCreationAttributes<BlockInstance>
> {
  declare id: CreationOptional<string>;
  declare orderIndex: CreationOptional<number>;
  declare blockShapeRef: ForeignKey<string>;
  declare name: string;
  declare active: boolean;
  declare bookingMode: 'true' | 'false' | 'override';
  declare agentPermissions: 'true' | 'false' | 'override';
  declare composite: boolean;
  declare differential: 'true' | 'false' | 'override';
  declare preClosing: boolean;
  declare icon: string | null;
  declare baseSqFt: number | null;
  declare allowMultiple: boolean;
  declare requiresUnitNumber: boolean;
  declare isMultiFamily: boolean;
  declare requiresAgent: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare partAssignments?: PartAssignment[];
  declare bookingCascades?: BookingCascade[];
}

export function BlockInstanceFactory(sequelize: Sequelize) {
  BlockInstance.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      blockShapeRef: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      bookingMode: {
        type: DataTypes.ENUM('true', 'false', 'override'),
        allowNull: false,
        defaultValue: DEFAULT_VALUES.BOOKING_MODE_STORAGE,
        field: FIELD_NAMES.BOOKING_MODE_SNAKE,
      },
      agentPermissions: {
        type: DataTypes.ENUM('true', 'false', 'override'),
        allowNull: false,
        defaultValue: DEFAULT_VALUES.BOOKING_MODE_STORAGE,
        field: FIELD_NAMES.AGENT_PERMISSIONS_SNAKE,
      },
      composite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      differential: {
        type: DataTypes.ENUM('true', 'false', 'override'),
        allowNull: false,
        defaultValue: 'false',
      },
      preClosing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'pre_closing',
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      baseSqFt: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      allowMultiple: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requiresUnitNumber: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isMultiFamily: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requiresAgent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: 'block_instance',
      tableName: 'block_instances',
      freezeTableName: true,
    }
  );

  return BlockInstance;
}
