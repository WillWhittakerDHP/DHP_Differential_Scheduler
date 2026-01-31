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

/**
 * Constraint enforcement level
 * LEARNING: Controls how strictly constraints are enforced
 * WHY: Provides flexibility in how constraints are applied (off = not applied, flexible = warn/soft block, hard = hard block)
 * PATTERN: Enum-like string literal union type
 */
export type ConstraintEnforcement = 'off' | 'flexible' | 'hard'

/**
 * Rolling week calculation direction
 * LEARNING: Determines how rolling 7-day window is calculated relative to appointment date
 * WHY: Different businesses may prefer different rolling week calculations
 * PATTERN: Enum-like string literal union type
 */
export type RollingWeekDirection = 'past' | 'centered' | 'future'

/**
 * Work capacity filter configuration
 * LEARNING: Configuration for a single capacity filter (daily, calendar week, or rolling week)
 * WHY: Encapsulates max hours and filter mode together
 * PATTERN: Interface with required fields
 */
export interface WorkCapacityFilter {
  maxHours: number
  enforcement: ConstraintEnforcement
}

/**
 * Rolling week capacity filter configuration
 * LEARNING: Extends WorkCapacityFilter with direction setting
 * WHY: Rolling week needs direction to determine date range calculation
 * PATTERN: Extends base interface with additional field
 */
export interface RollingWeekCapacityFilter extends WorkCapacityFilter {
  direction: RollingWeekDirection
}

/**
 * Range constraint type
 * LEARNING: Identifies the type of time-based restriction
 * WHY: Allows different range constraint types (businessHours, leadTime, dateRange) to coexist
 * PATTERN: Enum-like string literal union type
 */
export type RangeConstraintType = 'businessHours' | 'leadTime' | 'dateRange'

/**
 * Range constraint configuration
 * LEARNING: Configuration for business hours constraint
 * WHY: Encapsulates business hours per day
 * PATTERN: Interface with business hours map
 */
export interface BusinessHoursConfig {
  hours: AvailabilitySettingsData['businessHours']
}

/**
 * Range constraint configuration
 * LEARNING: Configuration for lead time constraint
 * WHY: Encapsulates minimum lead time in minutes
 * PATTERN: Interface with minutes field
 */
export interface LeadTimeConfig {
  minutes: number
}

/**
 * Range constraint configuration
 * LEARNING: Configuration for date range constraint
 * WHY: Encapsulates absolute start and end boundaries
 * PATTERN: Interface with start and end RFC3339 datetime strings
 */
export interface DateRangeConfig {
  start: string  // RFC3339 datetime
  end: string    // RFC3339 datetime
}

/**
 * Range constraint
 * LEARNING: Time-based restrictions that filter slots by when they can occur
 * WHY: Consolidates business hours, leadTime, and date range boundaries into unified structure
 * PATTERN: Interface with type, enforcement, and config
 */
export interface RangeConstraint {
  type: RangeConstraintType
  enforcement: ConstraintEnforcement
  config: BusinessHoursConfig | LeadTimeConfig | DateRangeConfig
}

/**
 * Buffer type for distinguishing buffer purposes
 * LEARNING: Identifies the purpose of a buffer configuration
 * WHY: Allows different buffer types (appointment, driveTime, lunch) to coexist
 * PATTERN: Enum-like string literal union type
 */
export type BufferType = 'appointment' | 'driveTime' | 'lunch'

/**
 * Buffer placement for controlling where buffer is applied
 * LEARNING: Controls where buffer time is placed around slots
 * WHY: Different buffer placements (before, after, both) serve different purposes
 * PATTERN: Enum-like string literal union type
 */
export type BufferPlacement = 'off' | 'before' | 'after' | 'both'

/**
 * Buffer configuration (now OverlapConstraint)
 * LEARNING: Configuration for a single buffer type (appointment, driveTime, or lunch)
 * WHY: Encapsulates buffer type, minutes, placement, and enforcement together
 * PATTERN: Interface with required fields, similar to WorkCapacityFilter
 */
export interface BufferConfig {
  type: BufferType
  minutes: number
  placement: BufferPlacement  // Renamed from mode
  enforcement: ConstraintEnforcement  // Added enforcement property
}

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
    appointment?: BufferConfig;    // Appointment buffer (adds time around appointments)
    driveTime?: BufferConfig;      // Drive time buffer (future: travel time between appointments)
    lunch?: BufferConfig;          // Lunch buffer (blocks time for lunch breaks)
  };
  maxWorkHours?: {
    day?: WorkCapacityFilter; // Work hours per day capacity filter
    calendarWeek?: WorkCapacityFilter; // Calendar week capacity filter
    rollingWeek?: RollingWeekCapacityFilter; // Rolling week capacity filter
  };
  timezone?: string; // IANA timezone (e.g., "America/New_York")
  durationRounding?: {
    enabled: boolean;
    increment?: number; // Minutes (defaults to minuteIncrement if not specified)
    method?: 'roundUp' | 'roundDown' | 'roundNearest';
  };
  differentialPerspectives?: {
    majorAttendees?: string[];  // UserTypeBlock IDs that make an event "major" (e.g., inspector)
    minorAttendees?: string[];   // UserTypeBlock IDs that make an event "minor" (e.g., client)
    majorLabel?: string;  // Display label for major perspective (e.g., "Inspector")
    minorLabel?: string;  // Display label for minor perspective (e.g., "Client Formal Presentation")
  };
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

