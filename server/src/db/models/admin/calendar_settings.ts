/**
 * WHY: Singleton table for calendar integration config (provider, calendars, hold duration, auto-confirm).
 * PATTERN: One row; GET returns setting_value; PUT upserts.
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
export type { CalendarSettingsData } from '../../../../../shared/types/calendarSettingsDocument.js'

export class CalendarSettings extends Model<
  InferAttributes<CalendarSettings>,
  InferCreationAttributes<CalendarSettings>
> {
  declare id: CreationOptional<string>;
  declare enabled: boolean;
  declare provider: string;
  declare holdDurationMinutes: number;
  declare holdDurationMin: number;
  declare holdDurationMax: number;
  declare holdDurationFallback: number;
  declare adminEntryTimeoutValue: number;
  declare adminEntryTimeoutUnit: string;
  declare autoConfirmEnabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function CalendarSettingsFactory(sequelize: Sequelize) {
  CalendarSettings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      provider: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'none' },
      holdDurationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
        field: 'hold_duration_minutes',
      },
      holdDurationMin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'hold_duration_min',
      },
      holdDurationMax: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        field: 'hold_duration_max',
      },
      holdDurationFallback: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
        field: 'hold_duration_fallback',
      },
      adminEntryTimeoutValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        field: 'admin_entry_timeout_value',
      },
      adminEntryTimeoutUnit: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'days',
        field: 'admin_entry_timeout_unit',
      },
      autoConfirmEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'auto_confirm_enabled',
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
      modelName: 'calendar_settings',
      tableName: 'calendar_settings',
      freezeTableName: true,
    }
  );

  return CalendarSettings;
}
