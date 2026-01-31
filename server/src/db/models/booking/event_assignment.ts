import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import type { EventInstance } from './event_instance.js';

/**
 * EventAssignment Model
 * 
 * Through-table for many-to-many relationship between PartInstance/BlockInstance and EventInstance.
 * Enables instances to have multiple event instances.
 * 
 * LEARNING: Assignment relationship pattern enables:
 * - Many-to-many relationships (one instance can have many event instances, one event instance can be used by many instances)
 * - Instance-level configuration (events are configured per instance, not per shape)
 * 
 * WHY: Using an assignment relationship table instead of storing event instances directly on instances allows:
 * - Reusability: Same event instance templates can be shared across multiple instances
 * - Instance-level configuration: Events are configured at instance level, matching the pattern used by parts and annotations
 * 
 * PATTERN: Assignment relationship model matching part_assignments pattern exactly
 * COMPARISON: EventAssignment is runtime (which events are assigned), EventShape/Instance are definitions/entities
 * 
 * NOTE: Uses parent_id/child_id pattern with parent_kind enum to handle multiple parent types (partInstance or blockInstance)
 */
export class EventAssignment extends Model<
  InferAttributes<EventAssignment>,
  InferCreationAttributes<EventAssignment>
> {
  declare id: CreationOptional<string>;
  declare kind: CreationOptional<string>;
  declare parent_kind: CreationOptional<string>;
  declare child_kind: CreationOptional<string>;
  declare parent_id: ForeignKey<string>;
  declare parentKind: 'partInstance' | 'blockInstance';
  declare child_id: ForeignKey<string>;
  // NOTE: Metadata (ternaryValue, orderIndex) removed - now stored in event_shapes table
  // Relationships just indicate which instances are active - metadata lives in shape tables
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare eventInstance?: EventInstance;
}

export function EventAssignmentFactory(sequelize: Sequelize) {
  EventAssignment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "eventAssignments";
        }
      },
      parent_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.parentKind;
        }
      },
      child_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "eventInstance";
        }
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Foreign key to parent instance (partInstance or blockInstance, determined by parent_kind)',
      },
      parentKind: {
        type: DataTypes.ENUM('partInstance', 'blockInstance'),
        allowNull: false,
        field: 'parent_kind',
        comment: 'Type of parent instance (partInstance or blockInstance)',
      },
      child_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'child_id',
        references: {
          model: 'event_instances',
          key: 'id',
        },
        comment: 'Foreign key to event_instances table',
      },
      // NOTE: Metadata columns (orderIndex, ternaryValue) removed - now stored in event_shapes table
      // Relationships just indicate which instances are active - metadata lives in shape tables
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
      underscored: true,
      schema: 'public',
      modelName: 'event_assignment',
      tableName: 'event_assignments',
      indexes: [
        {
          fields: ['parent_id'],
          name: 'idx_event_assignments_parent_id',
        },
        {
          fields: ['child_id'],
          name: 'idx_event_assignments_child_id',
        },
        {
          unique: true,
          fields: ['parent_id', 'child_id'],
          name: 'unique_event_assignments_parent_child',
        },
      ],
      freezeTableName: true,
    }
  );

  return EventAssignment;
}
