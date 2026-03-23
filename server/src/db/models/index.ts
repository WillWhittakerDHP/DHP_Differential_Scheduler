import { Sequelize } from "sequelize";
import { PartShapeFactory } from "./admin/part_shape.js";
import { PartInstanceFactory } from "./booking/part_instance.js";
import { BlockShapeFactory } from "./admin/block_shape.js";
import { BlockInstanceFactory } from "./booking/block_instance.js";
import { BlockInstanceVersionFactory } from "./booking/block_instance_version.js";
import { PartInstanceVersionFactory } from "./booking/part_instance_version.js";
import { ValidCascadeFactory } from "./admin/valid_cascade.js";
import { ValidPricingCascadeFactory } from "./admin/valid_pricing_cascade.js";
import { ValidPartFactory } from "./admin/valid_part.js";
import { ValidAnnotationFactory } from "./admin/valid_annotation.js";
import { ValidEventFactory } from "./admin/valid_event.js";
import { DependentInstanceFactory } from "./booking/dependent_instance.js";
import { BookingCascadeFactory } from "./booking/booking_cascade.js";
import { PricingCascadeFactory } from "./booking/pricing_cascade.js";
import { PartAssignmentFactory } from "./booking/part_assignment.js";
import { InstanceComponentFactory } from "./booking/instance_component.js";
import { AnnotationInstanceFactory } from "./booking/annotation_instance.js";
import { AnnotationInstanceContentFactory } from "./booking/annotation_instance_content.js";
import { AnnotationAssignmentFactory } from "./booking/annotation_assignment.js";
import { AnnotationShapeFactory } from "./booking/annotation_shape.js";
import { EventShapeFactory } from "./booking/event_shape.js";
import { EventInstanceFactory } from "./booking/event_instance.js";
import { EventAssignmentFactory } from "./booking/event_assignment.js";
import { EventShapeAttendeeFactory } from "./booking/event_shape_attendee.js";
import { AppointmentAttendeeFactory } from "./booking/appointment_attendee.js";
import { AddressFactory } from "./booking/address.js";
import { PropertyVersionFactory } from "./booking/property_version.js";
import { PropertyDetailsFactory } from "./booking/property_details.js";
import { PropertyVersionTypeFactory } from "./booking/property_version_type.js";
import { UserFactory } from "./participantModels/Users.js";
import { AppointmentFactory } from "./booking/appointment.js";
import { AppointmentSelectionLineFactory } from "./booking/appointment_selection_line.js";
import { AppointmentTimeSlotFactory } from "./booking/appointment_time_slot.js";
import { AppointmentFeeSummaryFactory } from "./booking/appointment_fee_summary.js";
import { AppointmentFeeEntryFactory } from "./booking/appointment_fee_entry.js";
import { ConstraintOverrideFactory } from "./booking/constraint_override.js";
import { CalendarSettingsFactory } from "./admin/calendar_settings.js";
import { WizardSettingsFactory } from "./admin/wizard_settings.js";
import { AvailabilitySettingFactory } from "./admin/availability_setting.js";
import { AvailabilityBusinessHourFactory } from "./admin/availability_business_hour.js";
import { AvailabilityBufferEntryFactory } from "./admin/availability_buffer_entry.js";
import { AvailabilityRangeConstraintFactory } from "./admin/availability_range_constraint.js";
import { AvailabilityRangeConstraintHourFactory } from "./admin/availability_range_constraint_hour.js";
import { AvailabilityMaxWorkHourFactory } from "./admin/availability_max_work_hour.js";
import { AvailabilityMaxIncomeRowFactory } from "./admin/availability_max_income_row.js";
import { AvailabilityDifferentialAttendeeFactory } from "./admin/availability_differential_attendee.js";
import { CalendarSettingCalendarFactory } from "./admin/calendar_setting_calendar.js";
import { BusinessRuleFactory } from "./admin/business_rule.js";
import { AdminMetadataFactory } from "./admin/adminMetadata.js";
import { AdminMetadataSelectOptionFactory } from "./admin/adminMetadataSelectOption.js";
import { AdminPrimitiveMetadataFactory } from "./admin/adminPrimitiveMetadata.js";
import { AdminPrimitiveMetadataSelectOptionFactory } from "./admin/adminPrimitiveMetadataSelectOption.js";
import { AdminRelationshipMetadataFactory } from "./admin/adminRelationshipMetadata.js";
import { AdminRelationshipMetadataSelectOptionFactory } from "./admin/adminRelationshipMetadataSelectOption.js";
import { BetaFeedbackFactory } from "./beta/beta_feedback.js";
import { BetaFeedbackTagFactory } from "./beta/beta_feedback_tag.js";
import { PropertyFieldMappingFactory } from "./mappings/property_field_mapping.js";
import { PropertyFeatureMappingFactory } from "./mappings/property_feature_mapping.js";

import { associateSequelizeModels } from "./sequelizeModelAssociations.js";
export function initializeModels(sequelize: Sequelize) {
  const PartShape = PartShapeFactory(sequelize);
  const PartInstance = PartInstanceFactory(sequelize);
  
  const BlockShape = BlockShapeFactory(sequelize);
  const BlockInstance = BlockInstanceFactory(sequelize);
  
  const BlockInstanceVersion = BlockInstanceVersionFactory(sequelize);
  const PartInstanceVersion = PartInstanceVersionFactory(sequelize);
  
  const ValidCascade = ValidCascadeFactory(sequelize);
  const ValidPart = ValidPartFactory(sequelize);
  const ValidAnnotation = ValidAnnotationFactory(sequelize);
  const ValidEvent = ValidEventFactory(sequelize);
  const DependentInstance = DependentInstanceFactory(sequelize);

  const BookingCascade = BookingCascadeFactory(sequelize);
  const PricingCascade = PricingCascadeFactory(sequelize);
  const ValidPricingCascade = ValidPricingCascadeFactory(sequelize);
  const PartAssignment = PartAssignmentFactory(sequelize);
  const InstanceComponent = InstanceComponentFactory(sequelize);

  const AnnotationShape = AnnotationShapeFactory(sequelize);
  const AnnotationInstance = AnnotationInstanceFactory(sequelize);
  const AnnotationInstanceContent = AnnotationInstanceContentFactory(sequelize);
  const AnnotationAssignment = AnnotationAssignmentFactory(sequelize);

  const EventShape = EventShapeFactory(sequelize);
  const EventInstance = EventInstanceFactory(sequelize);
  const EventAssignment = EventAssignmentFactory(sequelize);
  const EventShapeAttendee = EventShapeAttendeeFactory(sequelize);
  const AppointmentAttendee = AppointmentAttendeeFactory(sequelize);

  const Address = AddressFactory(sequelize);
  const PropertyVersion = PropertyVersionFactory(sequelize);
  const PropertyDetails = PropertyDetailsFactory(sequelize);
  const PropertyVersionType = PropertyVersionTypeFactory(sequelize);
  const User = UserFactory(sequelize);
  const Appointment = AppointmentFactory(sequelize);
  const AppointmentSelectionLine = AppointmentSelectionLineFactory(sequelize);
  const AppointmentTimeSlot = AppointmentTimeSlotFactory(sequelize);
  const AppointmentFeeSummary = AppointmentFeeSummaryFactory(sequelize);
  const AppointmentFeeEntry = AppointmentFeeEntryFactory(sequelize);
  const ConstraintOverride = ConstraintOverrideFactory(sequelize);

  const CalendarSettings = CalendarSettingsFactory(sequelize);
  const WizardSettings = WizardSettingsFactory(sequelize);
  const AvailabilitySetting = AvailabilitySettingFactory(sequelize);
  const AvailabilityBusinessHour = AvailabilityBusinessHourFactory(sequelize);
  const AvailabilityBufferEntry = AvailabilityBufferEntryFactory(sequelize);
  const AvailabilityRangeConstraint = AvailabilityRangeConstraintFactory(sequelize);
  const AvailabilityRangeConstraintHour = AvailabilityRangeConstraintHourFactory(sequelize);
  const AvailabilityMaxWorkHour = AvailabilityMaxWorkHourFactory(sequelize);
  const AvailabilityMaxIncomeRow = AvailabilityMaxIncomeRowFactory(sequelize);
  const AvailabilityDifferentialAttendee = AvailabilityDifferentialAttendeeFactory(sequelize);
  const CalendarSettingCalendar = CalendarSettingCalendarFactory(sequelize);
  const BusinessRule = BusinessRuleFactory(sequelize);
  // WHY: Follows entity pattern - single table with discriminator, backend routes based on field type
  const AdminMetadata = AdminMetadataFactory(sequelize);
  const AdminMetadataSelectOption = AdminMetadataSelectOptionFactory(sequelize);

  AdminMetadata.hasMany(AdminMetadataSelectOption, {
    foreignKey: "adminMetadataId",
    as: "selectOptions",
  });
  AdminMetadataSelectOption.belongsTo(AdminMetadata, {
    foreignKey: "adminMetadataId",
  });

  const AdminPrimitiveMetadata = AdminPrimitiveMetadataFactory(sequelize);
  const AdminRelationshipMetadata = AdminRelationshipMetadataFactory(sequelize);
  const AdminPrimitiveMetadataSelectOption = AdminPrimitiveMetadataSelectOptionFactory(sequelize);
  const AdminRelationshipMetadataSelectOption = AdminRelationshipMetadataSelectOptionFactory(sequelize);

  AdminPrimitiveMetadata.hasMany(AdminPrimitiveMetadataSelectOption, {
    foreignKey: "primitiveMetadataId",
    as: "selectOptions",
  });
  AdminPrimitiveMetadataSelectOption.belongsTo(AdminPrimitiveMetadata, {
    foreignKey: "primitiveMetadataId",
  });

  AdminRelationshipMetadata.hasMany(AdminRelationshipMetadataSelectOption, {
    foreignKey: "relationshipMetadataId",
    as: "selectOptions",
  });
  AdminRelationshipMetadataSelectOption.belongsTo(AdminRelationshipMetadata, {
    foreignKey: "relationshipMetadataId",
  });

  const BetaFeedback = BetaFeedbackFactory(sequelize);
  const BetaFeedbackTag = BetaFeedbackTagFactory(sequelize);
  const PropertyFieldMapping = PropertyFieldMappingFactory(sequelize);
  const PropertyFeatureMapping = PropertyFeatureMappingFactory(sequelize);

  BetaFeedback.hasMany(BetaFeedbackTag, { foreignKey: 'feedbackId', as: 'tags' });
  PropertyFeatureMapping.belongsTo(BlockInstance, {
    foreignKey: 'block_instance_id',
    as: 'blockInstance',
  });
  BlockInstance.hasMany(PropertyFeatureMapping, {
    foreignKey: 'block_instance_id',
    as: 'propertyFeatureMappings',
  });
  BetaFeedbackTag.belongsTo(BetaFeedback, { foreignKey: 'feedbackId', as: 'feedback' });


  associateSequelizeModels({
    PartShape, PartInstance, BlockShape, BlockInstance, BlockInstanceVersion, PartInstanceVersion,
    ValidCascade, ValidPart, ValidAnnotation, ValidEvent, DependentInstance,
    BookingCascade, PricingCascade, ValidPricingCascade, PartAssignment, InstanceComponent,
    AnnotationShape, AnnotationInstance, AnnotationInstanceContent, AnnotationAssignment,
    EventShape, EventInstance, EventAssignment, EventShapeAttendee, AppointmentAttendee,
    Address, PropertyVersion, PropertyDetails, PropertyVersionType, User, Appointment,
    AppointmentSelectionLine, AppointmentTimeSlot, AppointmentFeeSummary, AppointmentFeeEntry,
    ConstraintOverride, CalendarSettings, WizardSettings, AvailabilitySetting,
    AvailabilityBusinessHour, AvailabilityBufferEntry, AvailabilityRangeConstraint,
    AvailabilityRangeConstraintHour, AvailabilityMaxWorkHour, AvailabilityMaxIncomeRow,
    AvailabilityDifferentialAttendee, CalendarSettingCalendar, BusinessRule,
    AdminMetadata, AdminMetadataSelectOption, AdminPrimitiveMetadata, AdminPrimitiveMetadataSelectOption,
    AdminRelationshipMetadata, AdminRelationshipMetadataSelectOption,
    BetaFeedback, BetaFeedbackTag, PropertyFieldMapping, PropertyFeatureMapping,
  })

  return {
    PartInstance, PartShape,
    BlockInstance, BlockShape,
    BlockInstanceVersion, PartInstanceVersion,
    ValidCascade, ValidPart, ValidAnnotation, ValidEvent, ValidPricingCascade, DependentInstance,
    BookingCascade, PricingCascade, PartAssignment, InstanceComponent,
    AnnotationShape, AnnotationInstance, AnnotationInstanceContent, AnnotationAssignment,
    EventShape, EventInstance, EventAssignment, EventShapeAttendee,
    Address, PropertyVersion, PropertyDetails, PropertyVersionType, User, Appointment,
    AppointmentSelectionLine,
    AppointmentTimeSlot,
    AppointmentAttendee,
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
  };
}
