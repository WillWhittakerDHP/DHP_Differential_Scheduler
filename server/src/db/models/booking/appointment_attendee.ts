import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';
import { INVITATION_STATUS_FAILED, INVITATION_STATUS_SENT } from '@shared/constants/inviteStatusConstants.js';

import { Appointment } from './appointment';
import { User } from '../participantModels/Users';
import { BlockInstance } from './block_instance';

/**
 * AppointmentAttendee Model
 * 
 * Junction table linking appointments to actual Users with their roles.
 * Replaces hardcoded clientId/agentId with flexible attendee model.
 * 
 * LEARNING: Junction table pattern for flexible appointment attendees
 * WHY: Enables N attendees per appointment, proper calendar invitations, role tracking
 * 
 * Key relationships:
 * - appointment_id → appointments.id (the appointment)
 * - user_id → users.id (actual person with email for invitations)
 * - user_type_block_instance_id → block_instances.id (their role: Buyer, Agent, etc.)
 * 
 * - EventShapeAttendee: Template config (which user TYPES attend event TYPES)
 * - AppointmentAttendee: Actual instance (which actual USERS attend this appointment)
 */
export class AppointmentAttendee extends Model<
  InferAttributes<AppointmentAttendee>,
  InferCreationAttributes<AppointmentAttendee>
> {
  declare id: CreationOptional<string>;
  declare appointmentId: ForeignKey<string>;
  declare userId: ForeignKey<string>;
  declare userTypeBlockInstanceId: ForeignKey<string> | null;
  declare shouldReceiveInvitation: CreationOptional<boolean>;
  declare invitationStatus: CreationOptional<'pending' | typeof INVITATION_STATUS_SENT | 'accepted' | 'declined' | typeof INVITATION_STATUS_FAILED>;
  declare googleEventId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare appointment?: Appointment;
  declare user?: User;
  declare userTypeBlockInstance?: BlockInstance;
}

export function AppointmentAttendeeFactory(sequelize: Sequelize) {
  AppointmentAttendee.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      appointmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'appointment_id',
        references: {
          model: 'appointments',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'Actual person with email for calendar invitations',
      },
      userTypeBlockInstanceId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_type_block_instance_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
        comment: 'BlockInstance ID representing user type (Buyer, Agent, etc.)',
      },
      shouldReceiveInvitation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'should_receive_invitation',
        comment: 'Whether this attendee should receive calendar invitation',
      },
      invitationStatus: {
        type: DataTypes.ENUM('pending', INVITATION_STATUS_SENT, 'accepted', 'declined', INVITATION_STATUS_FAILED),
        allowNull: false,
        defaultValue: 'pending',
        field: 'invitation_status',
        comment: 'Status of calendar invitation for this attendee',
      },
      googleEventId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'google_event_id',
        comment: 'Google Calendar event ID for tracking invitation status',
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
      modelName: 'appointment_attendee',
      tableName: 'appointment_attendees',
      indexes: [
        {
          unique: true,
          fields: ['appointment_id', 'user_id'],
          name: 'unique_appointment_attendee',
        },
        {
          fields: ['appointment_id'],
          name: 'idx_appointment_attendees_appointment_id',
        },
        {
          fields: ['user_id'],
          name: 'idx_appointment_attendees_user_id',
        },
        {
          fields: ['user_type_block_instance_id'],
          name: 'idx_appointment_attendees_user_type_block_instance_id',
        },
        {
          fields: ['invitation_status'],
          name: 'idx_appointment_attendees_invitation_status',
        },
      ],
      freezeTableName: true,
    }
  );

  return AppointmentAttendee;
}
