import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize'

import { EventInstance } from './event_instance.js'
import { BlockInstance } from './block_instance.js'

/**
 * Segment-scoped attendee rows: which user-type block instances attend a given event_instance.
 * Replaces shape-level event_shape_attendees (Feature 20 §2.2).
 */
export class EventInstanceAttendee extends Model<
  InferAttributes<EventInstanceAttendee>,
  InferCreationAttributes<EventInstanceAttendee>
> {
  declare id: CreationOptional<string>
  declare eventInstanceId: ForeignKey<string>
  declare userTypeBlockInstanceId: ForeignKey<string>
  declare disabled: boolean
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare eventInstance?: EventInstance
  declare userTypeBlockInstance?: BlockInstance
}

export function EventInstanceAttendeeFactory(sequelize: Sequelize) {
  EventInstanceAttendee.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      eventInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'event_instance_id',
        references: {
          model: 'event_instances',
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
        comment: 'BlockInstance ID representing user type (user block shape)',
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: 'event_instance_attendee',
      tableName: 'event_instance_attendees',
      indexes: [
        {
          unique: true,
          fields: ['event_instance_id', 'user_type_block_instance_id'],
          name: 'unique_event_instance_attendee',
        },
        {
          fields: ['event_instance_id'],
          name: 'idx_event_instance_attendees_event_instance_id',
        },
        {
          fields: ['user_type_block_instance_id'],
          name: 'idx_event_instance_attendees_user_type_block_instance_id',
        },
      ],
      freezeTableName: true,
    }
  )

  return EventInstanceAttendee
}

