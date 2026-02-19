/**
 * AppointmentFeeSummary Model
 *
 * LEARNING: 1:1 with appointment; persisted at booking time as authoritative fee record
 * WHY: Enables fast income constraint queries (SUM total_fee) and auditability
 * PATTERN: Mirrors property_version structure — minimal parent record with FK to appointment
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

export class AppointmentFeeSummary extends Model<
  InferAttributes<AppointmentFeeSummary>,
  InferCreationAttributes<AppointmentFeeSummary>
> {
  declare id: CreationOptional<string>;
  declare appointmentId: ForeignKey<string>;
  declare baseFeeTotal: number;
  declare overageFeeTotal: number;
  declare totalFee: number;
  declare squareFootage: number;
  declare aduCount: number;
  declare currency: string;
  declare calculatedAt: Date;
  declare createdAt: CreationOptional<Date>;

  declare feeEntries?: unknown[];
}

export function AppointmentFeeSummaryFactory(sequelize: Sequelize) {
  AppointmentFeeSummary.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      appointmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'appointment_id',
        references: {
          model: 'appointments',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      baseFeeTotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'base_fee_total',
        get() {
          const value = this.getDataValue('baseFeeTotal');
          return value != null ? Number(value) : 0;
        },
      },
      overageFeeTotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'overage_fee_total',
        get() {
          const value = this.getDataValue('overageFeeTotal');
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
      squareFootage: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'square_footage',
        get() {
          const value = this.getDataValue('squareFootage');
          return value != null ? Number(value) : 0;
        },
      },
      aduCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'adu_count',
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      calculatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'calculated_at',
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
      modelName: 'appointment_fee_summary',
      tableName: 'appointment_fee_summaries',
      freezeTableName: true,
      indexes: [
        { fields: ['appointment_id'] },
        { fields: ['total_fee'] },
      ],
    }
  );

  return AppointmentFeeSummary;
}
