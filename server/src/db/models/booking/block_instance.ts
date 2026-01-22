import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import { ActivePart } from './active_part';
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
  declare isDependentInstance: boolean;
  declare visible: boolean;
  declare composite: boolean;
  declare differential: boolean;
  declare icon: string | null;
  declare baseSqFt: number | null;
  declare allowMultiple: boolean;
  declare requiresUnitNumber: boolean | null;
  declare availableDays: number[] | null; // Array of day indices (0-6), null = all days
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // ✅ Add valid children
  declare activeParts?: ActivePart[];
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
      isDependentInstance: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_dependent_instance', // Map to renamed column
      },
      visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      composite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      differential: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
        allowNull: true,
      },
      availableDays: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'available_days',
        comment: 'Array of day indices (0-6) when this service is available. Null means all days.'
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
      modelName: 'block_instance',
      tableName: 'block_instances',
      freezeTableName: true,
    }
  );

  return BlockInstance;
}
