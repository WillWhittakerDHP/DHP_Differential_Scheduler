import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

import type {
  ConstraintEnforcement,
  RollingWeekDirection,
  WorkCapacityFilter,
  RollingWeekCapacityFilter,
  IncomeCapacityFilter,
  RollingWeekIncomeCapacityFilter,
  RangeConstraintType,
  RangeConstraint,
  BufferConfig,
  DriveTimeApplyTo,
  DriveTimeConfig,
  DefaultLocation,
  DurationRoundingConfig,
  DriveTimeFeeConfig,
} from '../../../../../shared/types/availabilityTypes.js'
export type { ConstraintEnforcement, RollingWeekDirection, WorkCapacityFilter, RollingWeekCapacityFilter, IncomeCapacityFilter, RollingWeekIncomeCapacityFilter, RangeConstraintType, RangeConstraint, BufferConfig, DriveTimeApplyTo, DriveTimeConfig, DefaultLocation, DurationRoundingConfig, DriveTimeFeeConfig }

/** Availability-only config (calendar and wizard display live in calendar_settings / wizard_settings). */
export interface AvailabilitySettingsData {
  businessHours: {
    0: { start: string; end: string };
    1: { start: string; end: string };
    2: { start: string; end: string };
    3: { start: string; end: string };
    4: { start: string; end: string };
    5: { start: string; end: string };
    6: { start: string; end: string };
  };
  minuteIncrement: number;
  rangeConstraints?: {
    businessHours?: RangeConstraint;
    leadTime?: RangeConstraint;
    dateRange?: RangeConstraint;
  };
  buffers?: {
    appointment?: BufferConfig;
    driveToCandidate?: DriveTimeConfig;
    driveFromCandidate?: DriveTimeConfig;
    lunch?: BufferConfig;
  };
  maxWorkHours?: {
    day?: WorkCapacityFilter;
    calendarWeek?: WorkCapacityFilter;
    rollingWeek?: RollingWeekCapacityFilter;
  };
  maxIncome?: {
    day?: IncomeCapacityFilter;
    calendarWeek?: IncomeCapacityFilter;
    rollingWeek?: RollingWeekIncomeCapacityFilter;
  };
  overlapSources?: {
    outOfOffice?: {
      enforcement: ConstraintEnforcement;
    };
  };
  timezone?: string;
  durationRounding?: DurationRoundingConfig;
  /** Computation only; display labels live in wizard_settings. */
  differentialPerspectives?: {
    majorAttendees?: string[];
    minorAttendees?: string[];
  };
  defaultLocation?: DefaultLocation;
  driveTimeFee?: DriveTimeFeeConfig;
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

