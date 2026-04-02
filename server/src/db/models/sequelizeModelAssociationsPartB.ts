import { CONSTRAINT_OVERRIDE_FIELDS } from '../../routes/internal/appointments/appointmentConstants.js'
import type { SequelizeModelsBag } from './sequelizeModelsBag.js'

export function associateSequelizePropertyAdminAndAvailability(m: SequelizeModelsBag): void {
  const {
    PartShape,
    PartInstance,
    BlockShape,
    BlockInstance,
    BlockInstanceVersion,
    PartInstanceVersion,
    ValidBookingCascade,
    ValidPartCascade,
    ValidAnnotationAssignment,
    ValidEventCascade,
    DependentInstance,
    BookingCascade,
    PricingCascade,
    ValidPricingCascade,
    PartAssignment,
    InstanceComponent,
    AnnotationShape,
    AnnotationInstance,
    AnnotationInstanceContent,
    AnnotationAssignment,
    EventShape,
    EventInstance,
    EventAssignment,
    EventShapeAttendee,
    AppointmentAttendee,
    Address,
    PropertyVersion,
    PropertyDetails,
    PropertyVersionType,
    User,
    Appointment,
    AppointmentSelectionLine,
    AppointmentTimeSlot,
    AppointmentFeeSummary,
    AppointmentFeeEntry,
    ConstraintOverride,
    CalendarSettings,
    WizardSettings,
    AvailabilitySetting,
    AvailabilityBusinessHour,
    AvailabilityBufferEntry,
    AvailabilityRangeConstraint,
    AvailabilityRangeConstraintHour,
    AvailabilityMaxWorkHour,
    AvailabilityMaxIncomeRow,
    AvailabilityDifferentialAttendee,
    CalendarSettingCalendar,
    BusinessRule,
    AdminMetadata,
    AdminMetadataSelectOption,
    AdminPrimitiveMetadata,
    AdminPrimitiveMetadataSelectOption,
    AdminRelationshipMetadata,
    AdminRelationshipMetadataSelectOption,
    BetaFeedback,
    BetaFeedbackTag,
    PropertyFieldMapping,
    PropertyFeatureMapping,
    UserRoleBlockAlignment,
  } = m
  void UserRoleBlockAlignment

  Address.hasMany(PropertyVersion, { foreignKey: 'address_id', as: 'propertyVersions' });
  PropertyVersion.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
  
  PropertyVersion.hasMany(PropertyDetails, { foreignKey: 'property_version_id', as: 'propertyDetails' });
  PropertyDetails.belongsTo(PropertyVersion, { foreignKey: 'property_version_id', as: 'propertyVersion' });

  PropertyVersion.hasMany(Appointment, { foreignKey: 'property_version_id', as: 'appointments' });
  Appointment.belongsTo(PropertyVersion, { foreignKey: 'property_version_id', as: 'propertyVersion' });
  
  PropertyVersion.hasMany(PropertyVersionType, { foreignKey: 'property_version_id', as: 'propertyTypes' });
  PropertyVersionType.belongsTo(PropertyVersion, { foreignKey: 'property_version_id', as: 'propertyVersion' });
  BlockInstance.hasMany(PropertyVersionType, { foreignKey: 'block_instance_id', as: 'propertyVersionTypes' });
  PropertyVersionType.belongsTo(BlockInstance, { foreignKey: 'block_instance_id', as: 'blockInstance' });
  

  BlockInstance.hasMany(Appointment, { foreignKey: 'user_type_id', as: 'userTypeAppointments' });
  Appointment.belongsTo(BlockInstance, { foreignKey: 'user_type_id', as: 'userType' });

  Appointment.belongsTo(User, { foreignKey: 'scheduled_by_id', as: 'scheduledBy' });
  Appointment.belongsTo(User, { foreignKey: 'held_by', as: 'heldByUser' });

  Appointment.hasMany(AppointmentAttendee, { 
    foreignKey: 'appointment_id', 
    as: 'attendees' 
  });
  AppointmentAttendee.belongsTo(Appointment, { 
    foreignKey: 'appointment_id', 
    as: 'appointment' 
  });

  Appointment.hasMany(AppointmentSelectionLine, {
    foreignKey: CONSTRAINT_OVERRIDE_FIELDS.APPOINTMENT_ID,
    as: 'selectionLines',
  });
  AppointmentSelectionLine.belongsTo(Appointment, {
    foreignKey: CONSTRAINT_OVERRIDE_FIELDS.APPOINTMENT_ID,
    as: 'appointment',
  });

  Appointment.hasMany(AppointmentTimeSlot, {
    foreignKey: CONSTRAINT_OVERRIDE_FIELDS.APPOINTMENT_ID,
    as: 'timeSlots',
  });
  AppointmentTimeSlot.belongsTo(Appointment, {
    foreignKey: CONSTRAINT_OVERRIDE_FIELDS.APPOINTMENT_ID,
    as: 'appointment',
  });

  User.hasMany(AppointmentAttendee, { 
    foreignKey: 'user_id', 
    as: 'appointmentAttendances' 
  });
  AppointmentAttendee.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });

  BlockInstance.hasMany(AppointmentAttendee, { 
    foreignKey: 'user_type_block_instance_id', 
    as: 'appointmentAttendees' 
  });
  AppointmentAttendee.belongsTo(BlockInstance, {
    foreignKey: 'user_type_block_instance_id',
    as: 'userTypeBlockInstance'
  });

  Appointment.hasOne(AppointmentFeeSummary, {
    foreignKey: 'appointment_id',
    as: 'feeSummary',
  });
  AppointmentFeeSummary.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment',
  });
  AppointmentFeeSummary.hasMany(AppointmentFeeEntry, {
    foreignKey: 'fee_summary_id',
    as: 'feeEntries',
  });
  AppointmentFeeEntry.belongsTo(AppointmentFeeSummary, {
    foreignKey: 'fee_summary_id',
    as: 'feeSummary',
  });

  Appointment.hasMany(ConstraintOverride, {
    foreignKey: 'appointment_id',
    as: 'constraintOverrides',
  });
  ConstraintOverride.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment',
  });
  ConstraintOverride.belongsTo(User, {
    foreignKey: 'authorized_by_id',
    as: 'authorizedBy',
  });
  User.hasMany(ConstraintOverride, {
    foreignKey: 'authorized_by_id',
    as: 'constraintOverridesAuthorized',
  });

  BlockInstanceVersion.hasMany(PartInstanceVersion, {
    foreignKey: 'block_instance_version_id', 
    as: 'partInstanceVersions' 
  });
  PartInstanceVersion.belongsTo(BlockInstanceVersion, { 
    foreignKey: 'block_instance_version_id', 
    as: 'blockInstanceVersion' 
  });

  AvailabilitySetting.hasMany(AvailabilityBusinessHour, {
    foreignKey: 'availabilitySettingsId',
    as: 'availabilityBusinessHours',
  });
  AvailabilityBusinessHour.belongsTo(AvailabilitySetting, { foreignKey: 'availabilitySettingsId' });
  AvailabilitySetting.hasMany(AvailabilityBufferEntry, {
    foreignKey: 'availabilitySettingsId',
    as: 'availabilityBufferEntries',
  });
  AvailabilityBufferEntry.belongsTo(AvailabilitySetting, { foreignKey: 'availabilitySettingsId' });
  AvailabilitySetting.hasMany(AvailabilityRangeConstraint, {
    foreignKey: 'availabilitySettingsId',
    as: 'availabilityRangeConstraints',
  });
  AvailabilityRangeConstraint.belongsTo(AvailabilitySetting, { foreignKey: 'availabilitySettingsId' });
  AvailabilityRangeConstraint.hasMany(AvailabilityRangeConstraintHour, {
    foreignKey: 'rangeConstraintId',
    as: 'availabilityRangeConstraintHours',
  });
  AvailabilityRangeConstraintHour.belongsTo(AvailabilityRangeConstraint, { foreignKey: 'rangeConstraintId' });
  AvailabilitySetting.hasMany(AvailabilityMaxWorkHour, {
    foreignKey: 'availabilitySettingsId',
    as: 'availabilityMaxWorkHours',
  });
  AvailabilityMaxWorkHour.belongsTo(AvailabilitySetting, { foreignKey: 'availabilitySettingsId' });
  AvailabilitySetting.hasMany(AvailabilityMaxIncomeRow, {
    foreignKey: 'availabilitySettingsId',
    as: 'availabilityMaxIncomeRows',
  });
  AvailabilityMaxIncomeRow.belongsTo(AvailabilitySetting, { foreignKey: 'availabilitySettingsId' });
  AvailabilitySetting.hasMany(AvailabilityDifferentialAttendee, {
    foreignKey: 'availabilitySettingsId',
    as: 'availabilityDifferentialAttendees',
  });
  AvailabilityDifferentialAttendee.belongsTo(AvailabilitySetting, { foreignKey: 'availabilitySettingsId' });
  CalendarSettings.hasMany(CalendarSettingCalendar, {
    foreignKey: 'calendarSettingsId',
    as: 'calendarEntries',
  });
  CalendarSettingCalendar.belongsTo(CalendarSettings, { foreignKey: 'calendarSettingsId' });

}
