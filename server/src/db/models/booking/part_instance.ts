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
import type { PricingCascade } from './pricing_cascade.js';

/**
 * Part-instance value ledger (per block instance). Column names match the
 * canonical Base + PerUnit vocabulary in `.project-manager/ARCHITECTURE.md` §10.1a.
 */
export class PartInstance extends Model<
  InferAttributes<PartInstance>,
  InferCreationAttributes<PartInstance>
> {
  declare id: CreationOptional<string>;
  declare orderIndex: CreationOptional<number>;
  declare partShapeRef: ForeignKey<string>;
  declare name: CreationOptional<string>;
  declare baseFee: number;
  declare feePerUnit: number;
  declare baseTime: number;
  declare timePerUnit: number;
  declare active: boolean;
  declare zeroOutPart: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare pricingCascades?: PricingCascade[];
}

export function PartInstanceFactory(sequelize: Sequelize) {
  PartInstance.init(
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
      partShapeRef: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'part_shapes',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      baseFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      feePerUnit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      baseTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timePerUnit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      zeroOutPart: {
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
      modelName: 'part_instance',
      tableName: 'part_instances',
      freezeTableName: true,
    }
  );

  return PartInstance;
}
