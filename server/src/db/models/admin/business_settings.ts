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
} from '../../../../../shared/types/availabilityTypes.js'
import type { CalendarConfig, CalendarEntry, CalendarProvider } from '../../../../../shared/types/calendarTypes.js'

/**
 * Business Settings Model
 *
 * LEARNING: Stores admin-configurable business logic settings as key-value pairs with JSONB
 * WHY: Allows admin to configure availability settings (business hours, time increments, lead time) without code changes
 * PATTERN: Single record pattern with setting_key AVAILABILITY_SETTINGS_KEY storing AvailabilitySettings JSONB object
 * Type similarity UNIFY: availability and calendar types imported from shared (Phase 1.1/1.2).
 */

export type { ConstraintEnforcement, RollingWeekDirection, WorkCapacityFilter, RollingWeekCapacityFilter, IncomeCapacityFilter, RollingWeekIncomeCapacityFilter, RangeConstraintType, RangeConstraint, BufferConfig, DriveTimeApplyTo, DriveTimeConfig, DefaultLocation, DurationRoundingConfig }
export type { CalendarConfig, CalendarEntry, CalendarProvider }

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
  rangeConstraints?: {
    businessHours?: RangeConstraint;  // Business hours per day (always enforced)
    leadTime?: RangeConstraint;      // Lead time constraint (filters slots before now + minutes)
    dateRange?: RangeConstraint;     // Date range boundaries (absolute start/end limits)
  };
  buffers?: {
    appointment?: BufferConfig;       // Appointment buffer (adds time around appointments)
    driveToCandidate?: DriveTimeConfig;    // Travel time TO arrive at appointment (applied BEFORE)
    driveFromCandidate?: DriveTimeConfig;  // Travel time FROM appointment (applied AFTER)
    lunch?: BufferConfig;             // Lunch buffer (blocks time for lunch breaks)
    // driveTime?: BufferConfig;      // DEPRECATED: Use driveToCandidate/driveFromCandidate instead
  };
  maxWorkHours?: {
    day?: WorkCapacityFilter; // Work hours per day capacity filter
    calendarWeek?: WorkCapacityFilter; // Calendar week capacity filter
    rollingWeek?: RollingWeekCapacityFilter; // Rolling week capacity filter
  };
  maxIncome?: {
    day?: IncomeCapacityFilter;
    calendarWeek?: IncomeCapacityFilter;
    rollingWeek?: RollingWeekIncomeCapacityFilter;
  };
  /**
   * Overlap source enforcement (optional)
   * LEARNING: Controls whether specific event sources participate in overlap blocking
   * WHY: Allows admin to toggle out-of-office events as blockers without changing data fetching
   * PATTERN: Each source has an enforcement level (off = ignored, flexible = warn, hard = block)
   */
  overlapSources?: {
    outOfOffice?: {
      enforcement: ConstraintEnforcement;
    };
  };
  timezone?: string; // IANA timezone (e.g., "America/New_York")
  durationRounding?: DurationRoundingConfig;
  differentialPerspectives?: {
    majorAttendees?: string[];  // UserTypeBlock IDs that make an event "major" (e.g., inspector)
    minorAttendees?: string[];   // UserTypeBlock IDs that make an event "minor" (e.g., client)
    majorLabel?: string;  // Display label for major perspective (e.g., "Inspector")
    minorLabel?: string;  // Display label for minor perspective (e.g., "Client Formal Presentation")
    differentialGraphDefaultLabel?: string;  // Label shown when no time slot is selected (e.g., "Select a Time Slot")
    majorStateLabel?: string;  // State message when major perspective is selected (e.g., "Showing Major Times")
    minorStateLabel?: string;  // State message when minor perspective is selected (e.g., "Showing Client FormalPresentation Times")
  };
  calendarConfig?: CalendarConfig; // Calendar integration configuration
  defaultLocation?: DefaultLocation; // Starting/ending point for drive time calculations
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

