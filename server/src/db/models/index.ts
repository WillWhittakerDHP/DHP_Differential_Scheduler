import { Sequelize } from "sequelize";
import { PartShapeFactory } from "./admin/part_shape.js";
import { PartInstanceFactory } from "./booking/part_instance.js";
import { BlockShapeFactory } from "./admin/block_shape.js";
import { BlockInstanceFactory } from "./booking/block_instance.js";
import { BlockInstanceVersionFactory } from "./booking/block_instance_version.js";
import { PartInstanceVersionFactory } from "./booking/part_instance_version.js";
import { ValidCascadeFactory } from "./admin/valid_cascade.js";
import { ValidConstituentFactory } from "./admin/valid_constituent.js";
import { DependentInstanceOptionFactory } from "./booking/dependent_instance_option.js";
import { BookingCascadeFactory } from "./booking/booking_cascade.js";
import { ActiveConstituentFactory } from "./booking/active_constituent.js";
import { InstanceComponentFactory } from "./booking/instance_component.js";
import { AnnotationInstanceFactory } from "./booking/annotation_instance.js";
import { ActiveAnnotationFactory } from "./booking/active_annotation.js";
import { AnnotationShapeFactory } from "./booking/annotation_shape.js";
import { PropertyFactory } from "./booking/property.js";
import { AddressFactory } from "./booking/address.js";
import { PropertyVersionFactory } from "./booking/property_version.js";
import { PropertyDetailsFactory } from "./booking/property_details.js";
import { PropertyVersionTypeFactory } from "./booking/property_version_type.js";
import { UserFactory } from "./participantModels/Users.js";
import { AppointmentFactory } from "./booking/appointment.js";
import { BusinessSettingsFactory } from "./admin/business_settings.js";
import { AdminInputMetadataFactory } from "./admin/adminInputMetadata.js";
import { AdminRelationshipMetadataFactory } from "./admin/adminRelationshipMetadata.js";

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
  // Constituent: Block → Part relationships (math dimension)
  const ValidConstituent = ValidConstituentFactory(sequelize);
  // Dependent Instance Option: Instance-level valid dependent option relationships (blockInstance → blockInstance)
  const DependentInstanceOption = DependentInstanceOptionFactory(sequelize);

  // 4️⃣ Define Active Relationships (Booking Side)
  // Booking Cascade: Vertical hierarchy (different shapes, e.g., user_instance → service_instance)
  const BookingCascade = BookingCascadeFactory(sequelize);
  // Constituent: Block → Part relationships (math dimension)
  const ActiveConstituent = ActiveConstituentFactory(sequelize);
  // Instance Component: Option component relationships (blockInstance → blockInstance)
  const InstanceComponent = InstanceComponentFactory(sequelize);

  // 5️⃣ Define Annotation Models
  // AnnotationShape: Dynamic annotation shapes (shape-level: defines what annotation types can exist)
  const AnnotationShape = AnnotationShapeFactory(sequelize);
  // AnnotationInstance: Reusable, shared annotation instances (instance-level: concrete annotation entities)
  const AnnotationInstance = AnnotationInstanceFactory(sequelize);
  // ActiveAnnotation: Active relationship table for BlockInstance ↔ AnnotationInstance many-to-many
  const ActiveAnnotation = ActiveAnnotationFactory(sequelize);

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
  // AdminInputMetadata: Unified admin input metadata for all entity types
  const AdminInputMetadata = AdminInputMetadataFactory(sequelize);
  // AdminRelationshipMetadata: Relationship field metadata for all entity types
  const AdminRelationshipMetadata = AdminRelationshipMetadataFactory(sequelize);

  // 🔗 Shape → Instance Relationships
  PartShape.hasMany(PartInstance, { foreignKey: 'part_shape_ref', as: 'part_instances' });
  PartInstance.belongsTo(PartShape, { foreignKey: 'part_shape_ref', as: 'part_shape' });

  BlockShape.hasMany(BlockInstance, { foreignKey: 'block_shape_ref', as: 'block_instances' });
  BlockInstance.belongsTo(BlockShape, { foreignKey: 'block_shape_ref', as: 'block_shape' });

  // 🔄 Valid Cascade Relationships (BlockShape → BlockShape)
  BlockShape.hasMany(ValidCascade, { foreignKey: 'parent_id', as: 'valid_cascades' });
  ValidCascade.belongsTo(BlockShape, { foreignKey: 'child_id', as: 'valid_cascade_shape' });

  // 🔄 Valid Constituent Relationships (BlockShape → PartShape)
  BlockShape.hasMany(ValidConstituent, { foreignKey: 'parent_id', as: 'valid_constituents' });
  ValidConstituent.belongsTo(PartShape, { foreignKey: 'child_id', as: 'valid_constituent_shape' });

  // 🔄 Dependent Instance Option Relationships (BlockInstance → BlockInstance)
  BlockInstance.hasMany(DependentInstanceOption, { foreignKey: 'parent_id', as: 'dependent_instance_options' });
  DependentInstanceOption.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'dependent_instance_option_instance' });

  // 🔄 Booking Cascade Relationships (BlockInstance → BlockInstance)
  BlockInstance.hasMany(BookingCascade, { foreignKey: 'parent_id', as: 'booking_cascades' });
  BookingCascade.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'booking_cascade_instance' });

  // 🔄 Active Constituent Relationships (BlockInstance → PartInstance)
  BlockInstance.hasMany(ActiveConstituent, { foreignKey: 'parent_id', as: 'active_constituents' });
  ActiveConstituent.belongsTo(BlockInstance, { foreignKey: 'parent_id', as: 'active_constituent_block_instance' });
  ActiveConstituent.belongsTo(PartInstance, { foreignKey: 'child_id', as: 'active_constituent_part_instance' });

  // 🔄 Instance Component Relationships (BlockInstance → BlockInstance)
  BlockInstance.hasMany(InstanceComponent, { foreignKey: 'parent_id', as: 'instance_components' });
  InstanceComponent.belongsTo(BlockInstance, { foreignKey: 'child_id', as: 'instance_component_instance' });

  BlockInstance.belongsToMany(PartInstance, {
    through: ActiveConstituent,
    foreignKey: "parent_id",
    otherKey: "child_id",
    as: "active_constituent_part_instances",
  });

  // 📝 Annotation Relationships (BlockInstance ↔ AnnotationInstance)
  BlockInstance.belongsToMany(AnnotationInstance, {
    through: ActiveAnnotation,
    foreignKey: 'block_instance_id',
    otherKey: 'annotation_id',
    as: 'annotations',
  });

  AnnotationInstance.belongsToMany(BlockInstance, {
    through: ActiveAnnotation,
    foreignKey: 'annotation_id',
    otherKey: 'block_instance_id',
    as: 'block_instances',
  });

  BlockInstance.hasMany(ActiveAnnotation, {
    foreignKey: 'block_instance_id',
    as: 'active_annotations',
  });

  ActiveAnnotation.belongsTo(BlockInstance, {
    foreignKey: 'block_instance_id',
    as: 'blockInstance',
  });

  AnnotationInstance.hasMany(ActiveAnnotation, {
    foreignKey: 'annotation_id',
    as: 'active_annotations',
  });

  ActiveAnnotation.belongsTo(AnnotationInstance, {
    foreignKey: 'annotation_id',
    as: 'annotation',
  });

  // User type BlockInstance association (for user_type_block_instance_id)
  ActiveAnnotation.belongsTo(BlockInstance, {
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
    ValidCascade, ValidConstituent, DependentInstanceOption,
    BookingCascade, ActiveConstituent, InstanceComponent,
    AnnotationShape, AnnotationInstance, ActiveAnnotation,
    Address, PropertyVersion, PropertyDetails, PropertyVersionType, Property, User, Appointment,
    BusinessSettings,
    AdminInputMetadata,
    AdminRelationshipMetadata
  };
}
