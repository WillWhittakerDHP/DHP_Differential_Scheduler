import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class AvailabilityMaxWorkHour extends Model<
  InferAttributes<AvailabilityMaxWorkHour>,
  InferCreationAttributes<AvailabilityMaxWorkHour>
> {
  declare id: CreationOptional<string>
  declare availabilitySettingsId: string
  declare scope: string
  declare maxHours: number
  declare enforcement: string
  declare rollingDirection: CreationOptional<string | null>
}

export function AvailabilityMaxWorkHourFactory(sequelize: Sequelize) {
  AvailabilityMaxWorkHour.init(
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
      scope: { type: DataTypes.STRING, allowNull: false },
      maxHours: { type: DataTypes.DOUBLE, allowNull: false, field: 'max_hours' },
      enforcement: { type: DataTypes.STRING, allowNull: false },
      rollingDirection: { type: DataTypes.STRING, allowNull: true, field: 'rolling_direction' },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'availability_max_work_hours',
      tableName: 'availability_max_work_hours',
      freezeTableName: true,
    }
  )
  return AvailabilityMaxWorkHour
}
