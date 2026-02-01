import { Sequelize } from "sequelize";
import { PartShapeFactory } from "./admin/part_shape.js";
import { PartInstanceFactory } from "./booking/part_instance.js";
import { BlockShapeFactory } from "./admin/block_shape.js";
import { BlockInstanceFactory } from "./booking/block_instance.js";
import { BlockInstanceVersionFactory } from "./booking/block_instance_version.js";
import { PartInstanceVersionFactory } from "./booking/part_instance_version.js";
import { ValidCascadeFactory } from "./admin/valid_cascade.js";
import { ValidPartFactory } from "./admin/valid_part.js";
import { ValidAnnotationFactory } from "./admin/valid_annotation.js";
import { ValidEventFactory } from "./admin/valid_event.js";
import { DependentInstanceFactory } from "./booking/dependent_instance.js";
import { BookingCascadeFactory } from "./booking/booking_cascade.js";
import { PartAssignmentFactory } from "./booking/part_assignment.js";
import { InstanceComponentFactory } from "./booking/instance_component.js";
import { AnnotationInstanceFactory } from "./booking/annotation_instance.js";
import { AnnotationAssignmentFactory } from "./booking/annotation_assignment.js";
import { AnnotationShapeFactory } from "./booking/annotation_shape.js";
import { EventShapeFactory } from "./booking/event_shape.js";
import { EventInstanceFactory } from "./booking/event_instance.js";
import { EventAssignmentFactory } from "./booking/event_assignment.js";
import { EventShapeAttendeeFactory } from "./booking/event_shape_attendee.js";
import { PropertyFactory } from "./booking/property.js";
import { AddressFactory } from "./booking/address.js";
import { PropertyVersionFactory } from "./booking/property_version.js";
import { PropertyDetailsFactory } from "./booking/property_details.js";
import { PropertyVersionTypeFactory } from "./booking/property_version_type.js";
import { UserFactory } from "./participantModels/Users.js";
import { AppointmentFactory } from "./booking/appointment.js";
import { BusinessSettingsFactory } from "./admin/business_settings.js";
import { BusinessRuleFactory } from "./admin/business_rule.js";
import { AdminMetadataFactory } from "./admin/adminMetadata.js";

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
  const PartAssignment = PartAssignmentFactory(sequelize);
  const InstanceComponent = InstanceComponentFactory(sequelize);

  const AnnotationShape = AnnotationShapeFactory(sequelize);
  const AnnotationInstance = AnnotationInstanceFactory(sequelize);
  const AnnotationAssignment = AnnotationAssignmentFactory(sequelize);

  const EventShape = EventShapeFactory(sequelize);
  const EventInstance = EventInstanceFactory(sequelize);
  const EventAssignment = EventAssignmentFactory(sequelize);
  const EventShapeAttendee = EventShapeAttendeeFactory(sequelize);

  const Address = AddressFactory(sequelize);
  const PropertyVersion = PropertyVersionFactory(sequelize);
  const PropertyDetails = PropertyDetailsFactory(sequelize);
  const PropertyVersionType = PropertyVersionTypeFactory(sequelize);
  // Property: Property information (deprecated, kept for migration reference)
  const Property = PropertyFactory(sequelize);
  const User = UserFactory(sequelize);
  const Appointment = AppointmentFactory(sequelize);

  const BusinessSettings = BusinessSettingsFactory(sequelize);
  const BusinessRule = BusinessRuleFactory(sequelize);
  // WHY: Follows entity pattern - single table with discriminator, backend routes based on field type
  const AdminMetadata = AdminMetadataFactory(sequelize);

  PartShape.hasMany(PartInstance, { foreignKey: 'part_shape_ref', as: 'part_instances' });
  PartInstance.belongsTo(PartShape, { foreignKey: 'part_shape_ref', as: 'part_shape' });

  BlockShape.hasMany(BlockInstance, { foreignKey: 'block_shape_ref', as: 'block_instances' });
  BlockInstance.belongsTo(BlockShape, { foreignKey: 'block_shape_ref', as: 'block_shape' });

  BlockShape.hasMany(ValidCascade, { foreignKey: 'parent_id', as: 'valid_cascades' });
  ValidCascade.belongsTo(BlockShape, { foreignKey: 'child_id', as: 'valid_cascade_shape' });

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
    as: 'annotations',
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

  AnnotationInstance.belongsTo(AnnotationShape, {
    foreignKey: 'type',
    as: 'annotationShape',
  });

  AnnotationShape.hasMany(AnnotationInstance, {
    foreignKey: 'type',
    as: 'annotation_instances',
  });

  // LEARNING: EventAssignment uses parent_id/child_id pattern with parent_kind enum
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
  
  // NOTE: Property table and appointments.property_id column have been removed (Phase 2 migration)

  User.hasMany(Appointment, { foreignKey: 'client_id', as: 'clientAppointments' });
  User.hasMany(Appointment, { foreignKey: 'agent_id', as: 'agentAppointments' });
  Appointment.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
  Appointment.belongsTo(User, { foreignKey: 'agent_id', as: 'agent' });

  BlockInstance.hasMany(Appointment, { foreignKey: 'user_type_id', as: 'userTypeAppointments' });
  Appointment.belongsTo(BlockInstance, { foreignKey: 'user_type_id', as: 'userType' });
  

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
    ValidCascade, ValidPart, ValidAnnotation, ValidEvent, DependentInstance,
    BookingCascade, PartAssignment, InstanceComponent,
    AnnotationShape, AnnotationInstance, AnnotationAssignment,
    EventShape, EventInstance, EventAssignment, EventShapeAttendee,
    Address, PropertyVersion, PropertyDetails, PropertyVersionType, Property, User, Appointment,
    BusinessSettings, BusinessRule,
    AdminMetadata
  };
}
