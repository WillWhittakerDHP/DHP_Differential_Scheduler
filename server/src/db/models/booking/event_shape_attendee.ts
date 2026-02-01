import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import { EventShape } from './event_shape';
import { BlockInstance } from './block_instance';

/**
 * EventShapeAttendee Model
 * 
 * Through-table for many-to-many relationship between EventShape and UserTypeBlock instances (BlockInstances).
 * Enables event shapes to specify which user types (inspector, client, agent) attend the event.
 * 
 * LEARNING: Event attendee relationship pattern enables:
 * - Many-to-many relationships (one event shape can have many attendees, one user type can attend many events)
 * - Dynamic attendee configuration (admins can configure which user types attend which events)
 * - Type-safe references to UserTypeBlock instances (BlockInstances where blockShape.isStateControl === true)
 * 
 * WHY: Using a relationship table instead of storing attendees directly on event shapes allows:
 * - Flexibility: Event shapes can have multiple attendees
 * - Reusability: Same user type can attend multiple event shapes
 * - Maintainability: User types are configurable BlockInstances, not hardcoded strings
 * - Consistency: Matches annotation_assignment pattern with userTypeBlockInstanceId
 * 
 * PATTERN: Relationship model matching annotation_assignment pattern
 * COMPARISON: EventShapeAttendee links shapes to user types, EventAssignment links instances to events
 */
export class EventShapeAttendee extends Model<
  InferAttributes<EventShapeAttendee>,
  InferCreationAttributes<EventShapeAttendee>
> {
  declare id: CreationOptional<string>;
  declare eventShapeId: ForeignKey<string>;
  declare userTypeBlockInstanceId: ForeignKey<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare eventShape?: EventShape;
  declare userTypeBlockInstance?: BlockInstance; // The BlockInstance representing the user type
}

export function EventShapeAttendeeFactory(sequelize: Sequelize) {
  EventShapeAttendee.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      eventShapeId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'event_shape_id',
        references: {
          model: 'event_shapes',
          key: 'id',
        },
      },
      userTypeBlockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_type_block_instance_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
        comment: 'BlockInstance ID representing user type (must be a state control block)',
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
      underscored: true,
      schema: 'public',
      modelName: 'event_shape_attendee',
      tableName: 'event_shape_attendees',
      indexes: [
        {
          unique: true,
          fields: ['event_shape_id', 'user_type_block_instance_id'],
          name: 'unique_event_shape_attendee',
        },
        {
          fields: ['event_shape_id'],
          name: 'idx_event_shape_attendees_event_shape_id',
        },
        {
          fields: ['user_type_block_instance_id'],
          name: 'idx_event_shape_attendees_user_type_block_instance_id',
        },
      ],
      freezeTableName: true,
    }
  );

  return EventShapeAttendee;
}
