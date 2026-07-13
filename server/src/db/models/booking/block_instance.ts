import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import { FIELD_NAMES } from '../../../routes/internal/entities/entityConstants.js';
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
  declare composite: boolean;
  declare orchestrator: boolean;
  declare wizardVisible: boolean;
  declare preClosing: boolean;
  declare icon: string | null;
  declare requiresUnitNumber: boolean;
  declare isMultiFamily: boolean;
  declare requiresAgent: boolean;
  /** Canonical user role when parent block shape is user-semantic; null otherwise. */
  declare semanticType: string | null;
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
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
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
      semanticType: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'semantic_type',
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
