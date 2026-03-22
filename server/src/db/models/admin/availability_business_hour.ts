import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class AvailabilityBusinessHour extends Model<
  InferAttributes<AvailabilityBusinessHour>,
  InferCreationAttributes<AvailabilityBusinessHour>
> {
  declare id: CreationOptional<string>
  declare availabilitySettingsId: string
  declare dayOfWeek: number
  declare startAt: Date
  declare endAt: Date
}

export function AvailabilityBusinessHourFactory(sequelize: Sequelize) {
  AvailabilityBusinessHour.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      availabilitySettingsId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'availability_settings_id',
      },
      dayOfWeek: { type: DataTypes.SMALLINT, allowNull: false, field: 'day_of_week' },
      startAt: { type: DataTypes.DATE, allowNull: false, field: 'start_at' },
      endAt: { type: DataTypes.DATE, allowNull: false, field: 'end_at' },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'availability_business_hours',
      tableName: 'availability_business_hours',
      freezeTableName: true,
    }
  )
  return AvailabilityBusinessHour
}
