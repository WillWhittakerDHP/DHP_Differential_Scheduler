import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

/**
 * Business Settings Model
 * 
 * LEARNING: Stores admin-configurable business logic settings as key-value pairs with JSONB
 * WHY: Allows admin to configure availability settings (business hours, time increments, lead time) without code changes
 * PATTERN: Single record pattern with setting_key "availability_settings" storing AvailabilitySettings JSONB object
 * 
 * TypeScript types match AvailabilitySettings interface from client/src/configs/availabilitySettings.ts
 */
export interface AvailabilitySettingsData {
  businessHours: {
    0: { start: string; end: string }; // Sunday
    1: { start: string; end: string }; // Monday
    2: { start: string; end: string }; // Tuesday
    3: { start: string; end: string }; // Wednesday
    4: { start: string; end: string }; // Thursday
    5: { start: string; end: string }; // Friday
    6: { start: string; end: string }; // Saturday
  };
  minuteIncrement: number;
  leadTime: number;
  workHoursLimit?: number; // Maximum work hours per day
  timezone?: string; // IANA timezone (e.g., "America/New_York")
}

export class BusinessSettings extends Model<
  InferAttributes<BusinessSettings>,
  InferCreationAttributes<BusinessSettings>
> {
  declare id: CreationOptional<string>;
  declare settingKey: string;
  declare settingValue: AvailabilitySettingsData;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function BusinessSettingsFactory(sequelize: Sequelize) {
  BusinessSettings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      settingKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'setting_key',
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
      modelName: 'business_settings',
      tableName: 'business_settings',
      freezeTableName: true,
    }
  );

  return BusinessSettings;
}

