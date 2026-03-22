import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class CalendarSettingCalendar extends Model<
  InferAttributes<CalendarSettingCalendar>,
  InferCreationAttributes<CalendarSettingCalendar>
> {
  declare id: CreationOptional<string>
  declare calendarSettingsId: string
  declare sortOrder: number
  declare email: string
  declare label: CreationOptional<string | null>
  declare readFrom: boolean
  declare writeTo: boolean
}

export function CalendarSettingCalendarFactory(sequelize: Sequelize) {
  CalendarSettingCalendar.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      calendarSettingsId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'calendar_settings_id',
      },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, field: 'sort_order' },
      email: { type: DataTypes.STRING, allowNull: false },
      label: { type: DataTypes.STRING, allowNull: true },
      readFrom: { type: DataTypes.BOOLEAN, allowNull: false, field: 'read_from' },
      writeTo: { type: DataTypes.BOOLEAN, allowNull: false, field: 'write_to' },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'calendar_setting_calendars',
      tableName: 'calendar_setting_calendars',
      freezeTableName: true,
    }
  )
  return CalendarSettingCalendar
}
