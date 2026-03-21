import { Sequelize } from "sequelize";
import { FIELD_NAMES } from "../../routes/internal/entities/entityConstants.js";
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
import { BusinessSettingsFactory } from "./admin/business_settings.js";
import { CalendarSettingsFactory } from "./admin/calendar_settings.js";
import { WizardSettingsFactory } from "./admin/wizard_settings.js";
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

  const BusinessSettings = BusinessSettingsFactory(sequelize);
  const CalendarSettings = CalendarSettingsFactory(sequelize);
  const WizardSettings = WizardSettingsFactory(sequelize);
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

  PartShape.hasMany(PartInstance, { foreignKey: 'part_shape_ref', as: 'part_instances' });
  PartInstance.belongsTo(PartShape, { foreignKey: 'part_shape_ref', as: 'part_shape' });

  BlockShape.hasMany(BlockInstance, { foreignKey: 'block_shape_ref', as: 'block_instances' });
  BlockInstance.belongsTo(BlockShape, { foreignKey: 'block_shape_ref', as: 'block_shape' });

  BlockShape.hasMany(ValidCascade, { foreignKey: 'parent_id', as: 'valid_cascades' });
  ValidCascade.belongsTo(BlockShape, { foreignKey: 'child_id', as: 'valid_cascade_shape' });

  PartShape.hasMany(ValidPricingCascade, { foreignKey: 'parent_id', as: 'valid_pricing_cascades' });
  ValidPricingCascade.belongsTo(PartShape, { foreignKey: 'child_id', as: 'valid_pricing_cascade_shape' });

  BlockShape.hasMany(ValidPart, { foreignKey: 'parent_id', as: 'valid_parts' });
  ValidPart.belongsTo(PartShape, { foreignKey: 'child_id', as: 'valid_part_shape' });

  BlockShape.hasMany(ValidAnnotation, { foreignKey: 'parent_id', as: 'valid_annotations' });
  ValidAnnotation.belongsTo(AnnotationShape, { foreignKey: 'child_id', as: 'valid_annotation_shape' });

  PartShape.hasMany(ValidEvent, { foreignKey: 'parent_id', as: 'valid_events' });
  ValidEvent.belongsTo(EventShape, { foreignKey: 'child_id', as: 'valid_event_shape' });

  BlockInstance.hasMany(DependentInstance, { foreignKey: 'parent_id', as: 'dependent_instances' });
  DependentInstance.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'dependent_instance' });

  BlockInstance.hasMany(BookingCascade, { foreignKey: 'parent_id', as: 'booking_cascades' });
  BookingCascade.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'booking_cascade_instance' });

  PartInstance.hasMany(PricingCascade, { foreignKey: 'parent_id', as: 'pricing_cascades' });
  PricingCascade.belongsTo(PartInstance, { foreignKey: 'child_id', as: 'pricing_cascade_instance' });

  BlockInstance.hasMany(PartAssignment, { foreignKey: 'parent_id', as: 'part_assignments' });
  PartAssignment.belongsTo(BlockInstance, { foreignKey: 'parent_id', as: 'part_assignment_block_instance' });
  PartAssignment.belongsTo(PartInstance, { foreignKey: 'child_id', as: 'part_assignment_instance' });

  BlockInstance.hasMany(InstanceComponent, { foreignKey: 'parent_id', as: 'instance_components' });
  InstanceComponent.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'instance_component_instance' });

  BlockInstance.belongsToMany(PartInstance, {
    through: PartAssignment,
    foreignKey: "parent_id",
    otherKey: "child_id",
    as: "part_assignment_instances",
  });

  BlockInstance.belongsToMany(AnnotationInstance, {
    through: AnnotationAssignment,
    foreignKey: 'block_instance_id',
    otherKey: 'annotation_id',
    as: FIELD_NAMES.ANNOTATIONS,
  });

  AnnotationInstance.belongsToMany(BlockInstance, {
    through: AnnotationAssignment,
    foreignKey: 'annotation_id',
    otherKey: 'block_instance_id',
    as: 'block_instances',
  });

  BlockInstance.hasMany(AnnotationAssignment, {
    foreignKey: 'block_instance_id',
    as: 'annotation_assignments',
  });

  AnnotationAssignment.belongsTo(BlockInstance, {
    foreignKey: 'block_instance_id',
    as: 'blockInstance',
  });

  AnnotationInstance.hasMany(AnnotationAssignment, {
    foreignKey: 'annotation_id',
    as: 'annotation_assignments',
  });

  AnnotationAssignment.belongsTo(AnnotationInstance, {
    foreignKey: 'annotation_id',
    as: 'annotation',
  });

  AnnotationAssignment.belongsTo(BlockInstance, {
    foreignKey: 'user_type_block_instance_id',
    as: 'userTypeBlockInstance',
  });

  AnnotationInstance.hasMany(AnnotationInstanceContent, {
    foreignKey: 'annotation_instance_id',
    as: 'contentRows',
    onDelete: 'CASCADE',
  });
  AnnotationInstanceContent.belongsTo(AnnotationInstance, {
    foreignKey: 'annotation_instance_id',
    as: 'annotationInstance',
  });
  AnnotationInstanceContent.belongsTo(BlockInstance, {
    foreignKey: 'user_type_block_instance_id',
    as: 'userTypeBlockInstance',
  });

  AnnotationInstance.belongsTo(AnnotationShape, {
    foreignKey: 'type',
    as: 'annotationShape',
  });

  AnnotationShape.hasMany(AnnotationInstance, {
    foreignKey: 'type',
    as: 'annotation_instances',
  });

  // WHY: Matches partAssignments pattern exactly for consistency
  // PATTERN: parent_id references either partInstance or blockInstance based on parent_kind
  
  EventInstance.hasMany(EventAssignment, {
    foreignKey: 'child_id',
    as: 'event_assignments',
  });

  EventAssignment.belongsTo(EventInstance, {
    foreignKey: 'child_id',
    as: 'eventInstance',
  });

  // NOTE: Legacy shape associations removed - event_assignments now uses parent_id/child_id pattern

  EventInstance.belongsTo(EventShape, {
    foreignKey: 'event_shape_ref',
    as: 'eventShape',
  });

  EventShape.hasMany(EventInstance, {
    foreignKey: 'event_shape_ref',
    as: 'event_instances',
  });

  // PATTERN: Matches annotation_assignment pattern with userTypeBlockInstanceId
  EventShape.hasMany(EventShapeAttendee, {
    foreignKey: 'event_shape_id',
    as: 'event_shape_attendees',
  });

  EventShapeAttendee.belongsTo(EventShape, {
    foreignKey: 'event_shape_id',
    as: 'eventShape',
  });

  EventShapeAttendee.belongsTo(BlockInstance, {
    foreignKey: 'user_type_block_instance_id',
    as: 'userTypeBlockInstance',
  });

  BlockInstance.hasMany(EventShapeAttendee, {
    foreignKey: 'user_type_block_instance_id',
    as: 'event_shape_attendees',
  });

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
    foreignKey: 'appointmentId',
    as: 'selectionLines',
  });
  AppointmentSelectionLine.belongsTo(Appointment, {
    foreignKey: 'appointmentId',
    as: 'appointment',
  });

  Appointment.hasMany(AppointmentTimeSlot, {
    foreignKey: 'appointmentId',
    as: 'timeSlots',
  });
  AppointmentTimeSlot.belongsTo(Appointment, {
    foreignKey: 'appointmentId',
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
    BusinessSettings, CalendarSettings, WizardSettings, BusinessRule,
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
