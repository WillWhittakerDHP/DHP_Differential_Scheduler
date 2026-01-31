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
import { PropertyFactory } from "./booking/property.js";
import { AddressFactory } from "./booking/address.js";
import { PropertyVersionFactory } from "./booking/property_version.js";
import { PropertyDetailsFactory } from "./booking/property_details.js";
import { PropertyVersionTypeFactory } from "./booking/property_version_type.js";
import { UserFactory } from "./participantModels/Users.js";
import { AppointmentFactory } from "./booking/appointment.js";
import { BusinessSettingsFactory } from "./admin/business_settings.js";
import { AdminMetadataFactory } from "./admin/adminMetadata.js";

export function initializeModels(sequelize: Sequelize) {
  // 1️⃣ Define Part Models First
  const PartShape = PartShapeFactory(sequelize);
  const PartInstance = PartInstanceFactory(sequelize);
  
  // 2️⃣ Define Block Models Next
  const BlockShape = BlockShapeFactory(sequelize);
  const BlockInstance = BlockInstanceFactory(sequelize);
  
  // 2️⃣.5 Define Version Models
  const BlockInstanceVersion = BlockInstanceVersionFactory(sequelize);
  const PartInstanceVersion = PartInstanceVersionFactory(sequelize);
  
  // 3️⃣ Define Valid Relationships (Admin Side)
  // Cascade: Vertical hierarchy (different shapes, e.g., user_shape → service)
  const ValidCascade = ValidCascadeFactory(sequelize);
  // Part: Block → Part relationships (math dimension)
  const ValidPart = ValidPartFactory(sequelize);
  // Annotation: Block → Annotation relationships (similar to Block → Part)
  const ValidAnnotation = ValidAnnotationFactory(sequelize);
  // DependentInstance: Instance-level valid dependent relationships (blockInstance → blockInstance)
  const DependentInstance = DependentInstanceFactory(sequelize);

  // 4️⃣ Define Assignment Relationships (Booking Side)
  // Booking Cascade: Vertical hierarchy (different shapes, e.g., user_instance → service_instance)
  const BookingCascade = BookingCascadeFactory(sequelize);
  // Part Assignment: Block → Part relationships (math dimension)
  const PartAssignment = PartAssignmentFactory(sequelize);
  // Instance Component: Option component relationships (blockInstance → blockInstance)
  const InstanceComponent = InstanceComponentFactory(sequelize);

  // 5️⃣ Define Annotation Models
  // AnnotationShape: Dynamic annotation shapes (shape-level: defines what annotation types can exist)
  const AnnotationShape = AnnotationShapeFactory(sequelize);
  // AnnotationInstance: Reusable, shared annotation instances (instance-level: concrete annotation entities)
  const AnnotationInstance = AnnotationInstanceFactory(sequelize);
  // AnnotationAssignment: Assignment relationship table for BlockInstance ↔ AnnotationInstance many-to-many
  const AnnotationAssignment = AnnotationAssignmentFactory(sequelize);

  // 5️⃣.5 Define Event Models
  // EventShape: Dynamic event shapes (shape-level: defines what event types can exist)
  const EventShape = EventShapeFactory(sequelize);
  // EventInstance: Reusable, shared event instances (instance-level: concrete event configurations with templates)
  const EventInstance = EventInstanceFactory(sequelize);
  // EventAssignment: Assignment relationship table for PartShape/BlockShape ↔ EventInstance many-to-many
  const EventAssignment = EventAssignmentFactory(sequelize);

  // 6️⃣ Define Booking Data Models
  // Address: Stable address information from client input
  const Address = AddressFactory(sequelize);
  // PropertyVersion: Link table connecting addresses to versioned property details
  const PropertyVersion = PropertyVersionFactory(sequelize);
  // PropertyDetails: Versioned property details from API or manual input
  const PropertyDetails = PropertyDetailsFactory(sequelize);
  // PropertyVersionType: Junction table linking property_versions to property type block_instances
  const PropertyVersionType = PropertyVersionTypeFactory(sequelize);
  // Property: Property information (deprecated, kept for migration reference)
  const Property = PropertyFactory(sequelize);
  // User: User information (clients, agents, transaction managers, sellers)
  const User = UserFactory(sequelize);
  // Appointment: Appointment/booking information
  const Appointment = AppointmentFactory(sequelize);

  // 7️⃣ Define Admin Configuration Models
  // BusinessSettings: Admin-configurable business logic settings (availability settings, etc.)
  const BusinessSettings = BusinessSettingsFactory(sequelize);
  // AdminMetadata: Unified admin metadata for all entity types (primitives + relationships)
  // LEARNING: Single model replaces AdminPrimitiveMetadata and AdminRelationshipMetadata
  // WHY: Follows entity pattern - single table with discriminator, backend routes based on field type
  const AdminMetadata = AdminMetadataFactory(sequelize);

  // 🔗 Shape → Instance Relationships
  PartShape.hasMany(PartInstance, { foreignKey: 'part_shape_ref', as: 'part_instances' });
  PartInstance.belongsTo(PartShape, { foreignKey: 'part_shape_ref', as: 'part_shape' });

  BlockShape.hasMany(BlockInstance, { foreignKey: 'block_shape_ref', as: 'block_instances' });
  BlockInstance.belongsTo(BlockShape, { foreignKey: 'block_shape_ref', as: 'block_shape' });

  // 🔄 Valid Cascade Relationships (BlockShape → BlockShape)
  BlockShape.hasMany(ValidCascade, { foreignKey: 'parent_id', as: 'valid_cascades' });
  ValidCascade.belongsTo(BlockShape, { foreignKey: 'child_id', as: 'valid_cascade_shape' });

  // 🔄 Valid Part Relationships (BlockShape → PartShape)
  BlockShape.hasMany(ValidPart, { foreignKey: 'parent_id', as: 'valid_parts' });
  ValidPart.belongsTo(PartShape, { foreignKey: 'child_id', as: 'valid_part_shape' });

  // 🔄 Valid Annotation Relationships (BlockShape → AnnotationShape)
  BlockShape.hasMany(ValidAnnotation, { foreignKey: 'parent_id', as: 'valid_annotations' });
  ValidAnnotation.belongsTo(AnnotationShape, { foreignKey: 'child_id', as: 'valid_annotation_shape' });

  // 🔄 DependentInstance Relationships (BlockInstance → BlockInstance)
  BlockInstance.hasMany(DependentInstance, { foreignKey: 'parent_id', as: 'dependent_instances' });
  DependentInstance.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'dependent_instance' });

  // 🔄 Booking Cascade Relationships (BlockInstance → BlockInstance)
  BlockInstance.hasMany(BookingCascade, { foreignKey: 'parent_id', as: 'booking_cascades' });
  BookingCascade.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'booking_cascade_instance' });

  // 🔄 Part Assignment Relationships (BlockInstance → PartInstance)
  BlockInstance.hasMany(PartAssignment, { foreignKey: 'parent_id', as: 'part_assignments' });
  PartAssignment.belongsTo(BlockInstance, { foreignKey: 'parent_id', as: 'part_assignment_block_instance' });
  PartAssignment.belongsTo(PartInstance, { foreignKey: 'child_id', as: 'part_assignment_instance' });

  // 🔄 Instance Component Relationships (BlockInstance → BlockInstance)
  BlockInstance.hasMany(InstanceComponent, { foreignKey: 'parent_id', as: 'instance_components' });
  InstanceComponent.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'instance_component_instance' });

  BlockInstance.belongsToMany(PartInstance, {
    through: PartAssignment,
    foreignKey: "parent_id",
    otherKey: "child_id",
    as: "part_assignment_instances",
  });

  // 📝 Annotation Relationships (BlockInstance ↔ AnnotationInstance)
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

  // User type BlockInstance association (for user_type_block_instance_id)
  AnnotationAssignment.belongsTo(BlockInstance, {
    foreignKey: 'user_type_block_instance_id',
    as: 'userTypeBlockInstance',
  });

  // 📝 Annotation Shape Relationships (AnnotationInstance ↔ AnnotationShape)
  AnnotationInstance.belongsTo(AnnotationShape, {
    foreignKey: 'type',
    as: 'annotationShape',
  });

  AnnotationShape.hasMany(AnnotationInstance, {
    foreignKey: 'type',
    as: 'annotation_instances',
  });

  // 📅 Event Relationships (PartShape/BlockShape ↔ EventInstance)
  // PartShape → EventAssignment relationships (shape-level event configuration)
  PartShape.hasMany(EventAssignment, {
    foreignKey: 'part_shape_id',
    as: 'event_assignments',
  });

  EventAssignment.belongsTo(PartShape, {
    foreignKey: 'part_shape_id',
    as: 'partShape',
  });

  // BlockShape → EventAssignment relationships (shape-level event configuration for blocks)
  BlockShape.hasMany(EventAssignment, {
    foreignKey: 'block_shape_id',
    as: 'event_assignments',
  });

  EventAssignment.belongsTo(BlockShape, {
    foreignKey: 'block_shape_id',
    as: 'blockShape',
  });

  // EventInstance → EventAssignment relationships
  EventInstance.hasMany(EventAssignment, {
    foreignKey: 'event_instance_id',
    as: 'event_assignments',
  });

  EventAssignment.belongsTo(EventInstance, {
    foreignKey: 'event_instance_id',
    as: 'eventInstance',
  });

  // 📅 Event Shape Relationships (EventInstance ↔ EventShape)
  EventInstance.belongsTo(EventShape, {
    foreignKey: 'event_shape_ref',
    as: 'eventShape',
  });

  EventShape.hasMany(EventInstance, {
    foreignKey: 'event_shape_ref',
    as: 'event_instances',
  });

  // 🏠 Address → PropertyVersion → PropertyDetails Relationships
  Address.hasMany(PropertyVersion, { foreignKey: 'address_id', as: 'propertyVersions' });
  PropertyVersion.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
  
  PropertyVersion.hasMany(PropertyDetails, { foreignKey: 'property_version_id', as: 'propertyDetails' });
  PropertyDetails.belongsTo(PropertyVersion, { foreignKey: 'property_version_id', as: 'propertyVersion' });

  // 🏠 PropertyVersion → Appointment Relationships
  PropertyVersion.hasMany(Appointment, { foreignKey: 'property_version_id', as: 'appointments' });
  Appointment.belongsTo(PropertyVersion, { foreignKey: 'property_version_id', as: 'propertyVersion' });
  
  // 🏠 PropertyVersion → PropertyVersionType → BlockInstance Relationships (property types)
  PropertyVersion.hasMany(PropertyVersionType, { foreignKey: 'property_version_id', as: 'propertyTypes' });
  PropertyVersionType.belongsTo(PropertyVersion, { foreignKey: 'property_version_id', as: 'propertyVersion' });
  BlockInstance.hasMany(PropertyVersionType, { foreignKey: 'block_instance_id', as: 'propertyVersionTypes' });
  PropertyVersionType.belongsTo(BlockInstance, { foreignKey: 'block_instance_id', as: 'blockInstance' });
  
  // NOTE: Property table and appointments.property_id column have been removed (Phase 2 migration)
  // All property data is now in the normalized structure: addresses → property_versions → property_details

  // 👤 User → Appointment Relationships
  User.hasMany(Appointment, { foreignKey: 'client_id', as: 'clientAppointments' });
  User.hasMany(Appointment, { foreignKey: 'agent_id', as: 'agentAppointments' });
  Appointment.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
  Appointment.belongsTo(User, { foreignKey: 'agent_id', as: 'agent' });

  // 🔗 BlockInstance → Appointment Relationships
  // Note: user_type_id still uses FK relationship
  BlockInstance.hasMany(Appointment, { foreignKey: 'user_type_id', as: 'userTypeAppointments' });
  Appointment.belongsTo(BlockInstance, { foreignKey: 'user_type_id', as: 'userType' });
  
  // Note: selected_service_ids and selected_dwelling_adjustment_ids are now JSONB arrays
  // Relationships for these are handled via JSONB array lookups, not FK relationships

  // 🔄 Version Relationships (BlockInstanceVersion → PartInstanceVersion)
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
    ValidCascade, ValidPart, ValidAnnotation, DependentInstance,
    BookingCascade, PartAssignment, InstanceComponent,
    AnnotationShape, AnnotationInstance, AnnotationAssignment,
    EventShape, EventInstance, EventAssignment,
    Address, PropertyVersion, PropertyDetails, PropertyVersionType, Property, User, Appointment,
    BusinessSettings,
    AdminMetadata
  };
}
