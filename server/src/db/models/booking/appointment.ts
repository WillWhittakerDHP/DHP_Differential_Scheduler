import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize'
import type { AppointmentSelectionLine } from './appointment_selection_line.js'
import { emptyLegacySelectionFields, linesToLegacyFields } from '../../../repositories/appointmentSelectionCodec.js'

export interface BlockInstanceSnapshot {
  id: string
  name: string
  icon: string
  baseSqFt: number
  allowMultiple: boolean
  differential: boolean
  partInstances: Array<{
    id: string
    name: string
    baseFee: number
    baseTime: number
    rateOverBaseFee: number
    rateOverBaseTime: number
  }>
}

export class Appointment extends Model<
  InferAttributes<Appointment>,
  InferCreationAttributes<Appointment>
> {
  declare id: CreationOptional<string>
  declare propertyVersionId: ForeignKey<string>
  declare userTypeId: ForeignKey<string> | null
  /** Loaded with appointmentIncludes; flattened onto JSON via toJSON (not DB columns). */
  declare selectionLines?: AppointmentSelectionLine[]
  declare selectedDate: Date | null
  declare selectedDateRangeEnd: Date | null
  declare selectedTimeSlots: Array<Record<string, unknown>> | null
  declare isQuoteMode: boolean
  declare quotePdfUrl: string | null
  declare status: 'started' | 'held' | 'rescheduling' | 'quoted' | 'submitted' | 'confirmed' | 'cancelled' | 'deleted'
  declare scheduledById: ForeignKey<string> | null
  declare heldBy: ForeignKey<string> | null
  declare heldUntil: Date | null
  declare overrideConstraints: Record<string, boolean> | null
  declare submittedAt: Date | null
  declare confirmedAt: Date | null
  declare confirmedBy: ForeignKey<string> | null
  declare propertyDetails: Record<string, unknown> | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export function AppointmentFactory(sequelize: Sequelize) {
  Appointment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      propertyVersionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'property_version_id',
        references: {
          model: 'property_versions',
          key: 'id',
        },
      },
      userTypeId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_type_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      selectedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'selected_date',
      },
      selectedDateRangeEnd: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'selected_date_range_end',
      },
      selectedTimeSlots: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'selected_time_slots',
      },
      isQuoteMode: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_quote_mode',
      },
      quotePdfUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'quote_pdf_url',
      },
      status: {
        type: DataTypes.ENUM('started', 'held', 'rescheduling', 'quoted', 'submitted', 'confirmed', 'cancelled', 'deleted'),
        allowNull: false,
        defaultValue: 'started',
      },
      scheduledById: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'scheduled_by_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      heldBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'held_by',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      heldUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'held_until',
      },
      overrideConstraints: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'override_constraints',
        comment: 'Admin constraint overrides — keys match slot computation constraints (capacity, buffer, blackout, businessHours)',
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'submitted_at',
      },
      confirmedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'confirmed_at',
      },
      confirmedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'confirmed_by',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      propertyDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'property_details',
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
      underscored: false,
      schema: 'public',
      modelName: 'appointment',
      tableName: 'appointments',
      freezeTableName: true,
    }
  )

  const baseToJSON = Appointment.prototype.toJSON
  Appointment.prototype.toJSON = function appointmentToJSONWithSelections(): Record<string, unknown> {
    const plain = baseToJSON.call(this) as Record<string, unknown>
    const rawLines = plain.selectionLines
    delete plain.selectionLines
    if (Array.isArray(rawLines) && rawLines.length > 0) {
      Object.assign(plain, linesToLegacyFields(rawLines as AppointmentSelectionLine[]))
    } else {
      Object.assign(plain, emptyLegacySelectionFields())
    }
    return plain
  }

  return Appointment
}
