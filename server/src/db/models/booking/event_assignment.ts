import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import type { PartShape } from '../admin/part_shape.js';
import type { BlockShape } from '../admin/block_shape.js';
import type { EventInstance } from './event_instance.js';

/**
 * EventAssignment Model
 * 
 * Through-table for many-to-many relationship between PartShape/BlockShape and EventInstance.
 * Enables shapes to have multiple event instances with ordering and ternary value configuration.
 * 
 * LEARNING: Assignment relationship pattern enables:
 * - Many-to-many relationships (one shape can have many event instances, one event instance can be used by many shapes)
 * - Additional metadata on the relationship (orderIndex, ternaryValue)
 * - Shape-level configuration (all instances of a shape inherit the same event configuration)
 * 
 * WHY: Using an assignment relationship table instead of storing event instances directly on shapes allows:
 * - Reusability: Same event instance templates can be shared across multiple shapes
 * - Ordering: Multiple event instances per shape can be ordered via orderIndex
 * - Ternary logic: Event instances can specify ternary values (true/false/override) for onSite/clientPresent
 * - Shape-level configuration: Events are configured at shape level, not instance level
 * 
 * PATTERN: Assignment relationship model matching part_assignments/annotation_assignments pattern
 * COMPARISON: EventAssignment is runtime (which events are assigned), EventShape/Instance are definitions/entities
 * 
 * NOTE: Links to shapes (PartShape/BlockShape), not instances, because events are about the semantic meaning
 * of the shape, not specific instances. All instances of a shape inherit the same event configuration.
 */
export class EventAssignment extends Model<
  InferAttributes<EventAssignment>,
  InferCreationAttributes<EventAssignment>
> {
  declare id: CreationOptional<string>;
  declare partShapeId: ForeignKey<string> | null; // Shape-level event configuration
  declare blockShapeId: ForeignKey<string> | null; // Shape-level event configuration for blocks
  declare eventInstanceId: ForeignKey<string>;
  // NOTE: Metadata (ternaryValue, orderIndex) removed - now stored in event_shapes table
  // Relationships just indicate which shapes are active - metadata lives in shape tables
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare partShape?: PartShape;
  declare blockShape?: BlockShape;
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
      partShapeId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'part_shape_id',
        references: {
          model: 'part_shapes',
          key: 'id',
        },
        comment: 'Foreign key to part_shapes table (shape-level event configuration)',
      },
      blockShapeId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'block_shape_id',
        references: {
          model: 'block_shapes',
          key: 'id',
        },
        comment: 'Foreign key to block_shapes table (shape-level event configuration for blocks)',
      },
      eventInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'event_instance_id',
        references: {
          model: 'event_instances',
          key: 'id',
        },
        comment: 'Foreign key to event_instances table',
      },
      // NOTE: Metadata columns (orderIndex, ternaryValue) removed - now stored in event_shapes table
      // Relationships just indicate which shapes are active - metadata lives in shape tables
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
          fields: ['part_shape_id'],
          name: 'idx_event_assignments_part_shape_id',
        },
        {
          fields: ['block_shape_id'],
          name: 'idx_event_assignments_block_shape_id',
        },
        {
          fields: ['event_instance_id'],
          name: 'idx_event_assignments_event_instance_id',
        },
      ],
      freezeTableName: true,
    }
  );

  return EventAssignment;
}
