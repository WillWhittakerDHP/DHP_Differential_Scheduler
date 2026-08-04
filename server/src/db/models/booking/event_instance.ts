import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';
/**
 * EventInstance — concrete event segment owned by a parent event block instance.
 *
 * Event shapes define placement type (`placementKind` + `anchorEdge`); event instances
 * are the segment rows that carry invite templates, attendee behavior, and location data.
 * Routing remains relational through `event_assignments`, while
 * `parentBlockInstanceId` is the required ownership link for the segment itself.
 */
export class EventInstance extends Model<
  InferAttributes<EventInstance>,
  InferCreationAttributes<EventInstance>
> {
  declare id: CreationOptional<string>;
  declare eventShapeRef: ForeignKey<string>;
  declare name: string;
  declare titleTemplate: string | null;
  declare descriptionTemplate: string | null;
  declare locationTemplate: string | null;
  declare visibility: CreationOptional<'default' | 'public' | 'private' | 'confidential'>;
  declare transparency: CreationOptional<'opaque' | 'transparent'>;
  declare guestsCanModify: CreationOptional<boolean>;
  declare guestsCanInviteOthers: CreationOptional<boolean>;
  declare guestsCanSeeOtherGuests: CreationOptional<boolean>;
  declare addConferenceLink: CreationOptional<boolean>;
  declare sendUpdates: CreationOptional<'all' | 'externalOnly' | 'none'>;
  declare colorId: string | null;
  declare status: CreationOptional<'confirmed' | 'tentative'>;
  declare reminderOverrides: Array<{ method: 'email' | 'popup'; minutes: number }> | null;
  declare orderIndex: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  declare parentBlockInstanceId: string;
  declare locationType: CreationOptional<string | null>;
  declare locationPlaceId: CreationOptional<string | null>;
  declare locationAddress: CreationOptional<string | null>;
  declare locationLat: CreationOptional<number | null>;
  declare locationLng: CreationOptional<number | null>;
  declare includeRescheduleLink: CreationOptional<boolean>;
  declare includeCancelLink: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function EventInstanceFactory(sequelize: Sequelize) {
  EventInstance.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      eventShapeRef: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'event_shape_ref',
        references: {
          model: 'event_shapes',
          key: 'id',
        },
        comment: 'Foreign key to event_shapes table',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Event instance name/template name',
      },
      titleTemplate: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'title_template',
        comment: 'Template for event title (e.g., "{service} on {propertyType}")',
      },
      descriptionTemplate: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description_template',
        comment: 'Template for event description (e.g., "{clientName} - {propertyAddress}")',
      },
      locationTemplate: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'location_template',
        comment: 'Template for event location (e.g., "{propertyAddress}")',
      },
      visibility: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'default',
        comment: 'Event visibility: default, public, private, confidential',
      },
      transparency: {
        type: DataTypes.STRING(12),
        allowNull: false,
        defaultValue: 'opaque',
        comment: 'Free/busy: opaque (busy) or transparent (free)',
      },
      guestsCanModify: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'guests_can_modify',
        comment: 'Whether attendees can edit the event',
      },
      guestsCanInviteOthers: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'guests_can_invite_others',
        comment: 'Whether attendees can invite other people',
      },
      guestsCanSeeOtherGuests: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'guests_can_see_other_guests',
        comment: 'Whether attendees can see the guest list',
      },
      addConferenceLink: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'add_conference_link',
        comment: 'Whether to auto-attach a Google Meet link',
      },
      sendUpdates: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'all',
        field: 'send_updates',
        comment: 'Email invitation behavior: all, externalOnly, none',
      },
      colorId: {
        type: DataTypes.STRING(4),
        allowNull: true,
        defaultValue: null,
        field: 'color_id',
        comment: 'Google Calendar event color ID (1-11), null for default',
      },
      status: {
        type: DataTypes.STRING(12),
        allowNull: false,
        defaultValue: 'confirmed',
        comment: 'Event status: confirmed or tentative',
      },
      reminderOverrides: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null,
        field: 'reminder_overrides',
        comment: 'JSON array of reminder overrides, e.g. [{"method":"popup","minutes":10}]',
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order index for UI drag-and-drop ordering',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this event instance is active/enabled',
      },
      parentBlockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'parent_block_instance_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
        comment: 'Owning event block instance for this segment',
      },
      locationType: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: 'location_type',
        comment: 'Structured segment location semantics (optional)',
      },
      locationPlaceId: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'location_place_id',
      },
      locationAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'location_address',
      },
      locationLat: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'location_lat',
      },
      locationLng: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'location_lng',
      },
      includeRescheduleLink: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'include_reschedule_link',
        comment: 'Per-segment: strip {rescheduleLink} from invites when false',
      },
      includeCancelLink: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'include_cancel_link',
        comment: 'Per-segment: strip {cancelLink} from invites when false',
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
      modelName: 'event_instance',
      tableName: 'event_instances',
      freezeTableName: true,
      indexes: [
        {
          fields: ['event_shape_ref'],
          name: 'idx_event_instances_event_shape_ref',
        },
        {
          fields: ['parent_block_instance_id'],
          name: 'idx_event_instances_parent_block_instance_id',
        },
      ],
    }
  );

  return EventInstance;
}
