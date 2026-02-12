import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

import { AVAILABILITY_SETTINGS_KEY } from '../../../constants/appConstants.js'

/**
 * Business Settings Model
 *
 * LEARNING: Stores admin-configurable business logic settings as key-value pairs with JSONB
 * WHY: Allows admin to configure availability settings (business hours, time increments, lead time) without code changes
 * PATTERN: Single record pattern with setting_key AVAILABILITY_SETTINGS_KEY storing AvailabilitySettings JSONB object
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

/**
 * Drive time application rules
 * LEARNING: Controls when drive time buffers are applied based on slot position
 * WHY: Slots at business hours boundaries may need different handling than middle slots
 * PATTERN: Enum-like string literal union type
 * 
 * Session 2.2.3: Changed from first_only/last_only to skipDayStart/skipDayEnd for exclusionary logic
 */
export type DriveTimeApplyTo = 'all' | 'skipDayStart' | 'skipDayEnd' | 'none'

/**
 * Drive time buffer configuration
 * LEARNING: Semantic buffer for travel time with application rules
 * WHY: driveToCandidate/driveFromCandidate have implicit placement (before/after) - no ambiguity
 * PATTERN: Interface with minutes, enforcement, and applyTo (no placement needed)
 */
export interface DriveTimeConfig {
  minutes: number;
  enforcement: ConstraintEnforcement;
  applyTo: DriveTimeApplyTo;
}

/**
 * Default location for drive time calculations
 * LEARNING: Starting/ending point for first/last appointment drive times
 * WHY: Needed to calculate travel time from home/office to first appointment
 * PATTERN: Interface with placeId as primary identifier, address optional for UI display
 * Session 2.2.2: Added placeId for Routes API integration
 */
export interface DefaultLocation {
  placeId: string;           // Google Place ID (primary location identifier)
  address?: string;          // Address string for UI display only (optional, from autocomplete)
  label?: string;            // Optional label like "Home Office", "Shop", etc.
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Calendar provider type
 * LEARNING: Identifies the calendar service provider
 * WHY: Supports multiple calendar providers (Google, Outlook)
 * PATTERN: Enum-like string literal union type
 */
export type CalendarProvider = 'google' | 'outlook' | 'none'

/**
 * Calendar entry with read/write permissions
 * LEARNING: Individual calendar configuration with explicit permissions
 * WHY: Allows admin to configure which calendars are read vs written to
 * PATTERN: Interface with email, optional label, and permission flags
 */
export interface CalendarEntry {
  email: string           // Calendar email address (e.g., "will@districthomepro.com")
  label?: string          // Optional friendly name (e.g., "Work Calendar")
  readFrom: boolean       // Check this calendar for availability (free-busy)
  writeTo: boolean        // Create appointments on this calendar
}

/**
 * Calendar configuration
 * LEARNING: Configuration for which calendars to check for free-busy data and where to create events
 * WHY: Allows admin to configure multiple calendar sources with explicit read/write permissions
 * PATTERN: Dynamic array of calendar entries instead of fixed labeled fields
 */
export interface CalendarConfig {
  enabled: boolean
  provider: CalendarProvider
  calendars: CalendarEntry[]  // Dynamic list instead of fixed object
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

