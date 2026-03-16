/**
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
import type { CalendarConfig } from '../../../../../shared/types/calendarTypes.js';

export interface CalendarSettingsData extends CalendarConfig {
  /** When true, appointments created with status 'submitted' are auto-transitioned to 'confirmed'. */
  autoConfirmEnabled?: boolean;
}

export class CalendarSettings extends Model<
  InferAttributes<CalendarSettings>,
  InferCreationAttributes<CalendarSettings>
> {
  declare id: CreationOptional<string>;
  declare settingValue: CalendarSettingsData;
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
      settingValue: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: 'setting_value',
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
