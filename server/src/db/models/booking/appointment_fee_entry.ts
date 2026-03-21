/**
 * AppointmentFeeEntry Model
 *
 *
 * CRITICAL: block_instance_id and block_shape_ref have NO FK constraints
 */

import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

export class AppointmentFeeEntry extends Model<
  InferAttributes<AppointmentFeeEntry>,
  InferCreationAttributes<AppointmentFeeEntry>
> {
  declare id: CreationOptional<string>;
  declare feeSummaryId: ForeignKey<string>;
  declare blockInstanceId: string;
  declare blockName: string;
  declare blockShapeRef: string;
  declare baseFee: number;
  declare overageFee: number;
  declare totalFee: number;
  declare quantity: number;
  declare createdAt: CreationOptional<Date>;
}

export function AppointmentFeeEntryFactory(sequelize: Sequelize) {
  AppointmentFeeEntry.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      feeSummaryId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'fee_summary_id',
        references: {
          model: 'appointment_fee_summaries',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      blockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_instance_id',
      },
      blockName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'block_name',
      },
      blockShapeRef: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_shape_ref',
      },
      baseFee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'base_fee',
        get() {
          const value = this.getDataValue('baseFee');
          return value != null ? Number(value) : 0;
        },
      },
      overageFee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'overage_fee',
        get() {
          const value = this.getDataValue('overageFee');
          return value != null ? Number(value) : 0;
        },
      },
      totalFee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'total_fee',
        get() {
          const value = this.getDataValue('totalFee');
          return value != null ? Number(value) : 0;
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
      modelName: 'appointment_fee_entry',
      tableName: 'appointment_fee_entries',
      freezeTableName: true,
      indexes: [
        { fields: ['fee_summary_id'] },
        { fields: ['block_instance_id'] },
        { fields: ['block_shape_ref'] },
      ],
    }
  );

  return AppointmentFeeEntry;
}
