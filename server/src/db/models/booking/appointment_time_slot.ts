import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize'

export class AppointmentTimeSlot extends Model<
  InferAttributes<AppointmentTimeSlot>,
  InferCreationAttributes<AppointmentTimeSlot>
> {
  declare id: CreationOptional<string>
  declare appointmentId: ForeignKey<string>
  declare sortOrder: number
  declare startAt: Date
  declare endAt: Date
  declare durationMinutes: CreationOptional<number | null>
  declare slotMetadata: CreationOptional<Record<string, unknown> | null>
}

export function AppointmentTimeSlotFactory(sequelize: Sequelize) {
  AppointmentTimeSlot.init(
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
        field: 'appointment_id',
        references: { model: 'appointments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sort_order',
      },
      startAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_at',
      },
      endAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'end_at',
      },
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'duration_minutes',
      },
      slotMetadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'slot_metadata',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'appointment_time_slot',
      tableName: 'appointment_time_slots',
      freezeTableName: true,
    }
  )

  return AppointmentTimeSlot
}
