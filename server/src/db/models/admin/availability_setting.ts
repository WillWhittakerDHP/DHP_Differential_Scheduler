import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

import { AVAILABILITY_SETTINGS_KEY } from '../../../constants/appConstants.js'

export class AvailabilitySetting extends Model<
  InferAttributes<AvailabilitySetting>,
  InferCreationAttributes<AvailabilitySetting>
> {
  declare id: CreationOptional<string>
  declare minuteIncrement: number
  declare timezone: CreationOptional<string | null>
  declare defaultLocationPlaceId: CreationOptional<string | null>
  declare defaultLocationAddress: CreationOptional<string | null>
  declare defaultLocationLabel: CreationOptional<string | null>
  declare defaultLocationLat: CreationOptional<number | null>
  declare defaultLocationLng: CreationOptional<number | null>
  declare durationRoundingEnabled: boolean
  declare durationRoundingIncrement: CreationOptional<number | null>
  declare durationRoundingMethod: CreationOptional<string | null>
  declare overlapOutOfOfficeEnforcement: CreationOptional<string | null>
  declare driveTimeFeeComplimentaryMinutes: number
  declare driveTimeFeeRatePerHour: number
  declare driveTimeFeeRoundingMinutes: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export function AvailabilitySettingFactory(sequelize: Sequelize) {
  AvailabilitySetting.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      minuteIncrement: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'minute_increment',
      },
      timezone: { type: DataTypes.STRING, allowNull: true, field: 'timezone' },
      defaultLocationPlaceId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'default_location_place_id',
      },
      defaultLocationAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'default_location_address',
      },
      defaultLocationLabel: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'default_location_label',
      },
      defaultLocationLat: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'default_location_lat',
      },
      defaultLocationLng: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'default_location_lng',
      },
      durationRoundingEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'duration_rounding_enabled',
      },
      durationRoundingIncrement: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'duration_rounding_increment',
      },
      durationRoundingMethod: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'duration_rounding_method',
      },
      overlapOutOfOfficeEnforcement: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'overlap_out_of_office_enforcement',
      },
      driveTimeFeeComplimentaryMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'drive_time_fee_complimentary_minutes',
      },
      driveTimeFeeRatePerHour: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
        field: 'drive_time_fee_rate_per_hour',
      },
      driveTimeFeeRoundingMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
        field: 'drive_time_fee_rounding_minutes',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: AVAILABILITY_SETTINGS_KEY,
      tableName: AVAILABILITY_SETTINGS_KEY,
      freezeTableName: true,
    }
  )
  return AvailabilitySetting
}
