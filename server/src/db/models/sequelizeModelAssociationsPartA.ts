import { FIELD_NAMES } from '../../routes/internal/entities/entityConstants.js'
import type { SequelizeModelsBag } from './sequelizeModelsBag.js'

export function associateSequelizeShapesAndEvents(m: SequelizeModelsBag): void {
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

  PartShape.hasMany(PartInstance, { foreignKey: 'part_shape_ref', as: 'part_instances' });
  PartInstance.belongsTo(PartShape, { foreignKey: 'part_shape_ref', as: 'part_shape' });

  BlockShape.hasMany(BlockInstance, { foreignKey: 'block_shape_ref', as: 'block_instances' });
  BlockInstance.belongsTo(BlockShape, { foreignKey: 'block_shape_ref', as: 'block_shape' });

  BlockShape.hasMany(ValidBookingCascade, { foreignKey: 'parent_id', as: 'validBookingCascades' });
  ValidBookingCascade.belongsTo(BlockShape, { foreignKey: 'child_id', as: 'valid_booking_cascade_shape' });

  PartShape.hasMany(ValidPricingCascade, { foreignKey: 'parent_id', as: 'valid_pricing_cascades' });
  ValidPricingCascade.belongsTo(PartShape, { foreignKey: 'child_id', as: 'valid_pricing_cascade_shape' });

  BlockShape.hasMany(ValidPartCascade, { foreignKey: 'parent_id', as: 'validPartCascades' });
  ValidPartCascade.belongsTo(PartShape, { foreignKey: 'child_id', as: 'valid_part_cascade_shape' });

  BlockShape.hasMany(ValidAnnotationAssignment, { foreignKey: 'parent_id', as: 'validAnnotationAssignments' });
  ValidAnnotationAssignment.belongsTo(AnnotationShape, { foreignKey: 'child_id', as: 'valid_annotation_shape' });

  BlockShape.hasMany(ValidEventCascade, { foreignKey: 'parent_id', as: 'validEventCascades' });
  ValidEventCascade.belongsTo(BlockShape, { foreignKey: 'parent_id', as: 'block_shape' });
  ValidEventCascade.belongsTo(EventShape, { foreignKey: 'child_id', as: 'valid_event_cascade_shape' });

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
}
