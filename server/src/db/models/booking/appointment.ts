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
import type { AppointmentTimeSlot } from './appointment_time_slot.js'
import { emptyFlatSelectionFields, linesToFlatSelectionFields } from '../../../repositories/appointmentSelectionCodec.js'
import {
  overrideConstraintsObjectFromBooleans,
  stripOverrideConstraintVirtualKeysFromPlain,
} from '../../../repositories/appointmentOverrideConstraintsCodec.js'
import { rowsToLegacySelectedTimeSlots } from '../../../repositories/appointmentTimeSlotCodec.js'
import { propertyDetailsApiShapeFromPropertyVersionJson } from '../../../repositories/appointmentPropertyDetailsApiShape.js'
import {
  APPOINTMENT_STATUS_STARTED,
  APPOINTMENT_STATUS_VALUES,
  type AppointmentStatusLiteral,
} from '@shared/constants/appointmentStatusLiterals.js'
import { manualCreatedUpdatedAtColumns } from '../shared/manualCreatedUpdatedAtColumns.js'

export interface BlockInstanceSnapshot {
  id: string
  name: string
  icon: string
  baseSqFt: number
  orchestrator: boolean
  wizardVisible: boolean
  partInstances: Array<{
    id: string
    name: string
    baseFee: number
    baseTime: number
    feePerUnit: number
    timePerUnit: number
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
  /** Loaded with appointmentIncludes; flattened to `selectedTimeSlots` in toJSON. */
  declare timeSlots?: AppointmentTimeSlot[]
  declare selectedDate: Date | null
  declare selectedDateRangeEnd: Date | null
  declare isQuoteMode: boolean
  declare quotePdfUrl: string | null
  declare status: AppointmentStatusLiteral
  declare scheduledById: ForeignKey<string> | null
  declare heldBy: ForeignKey<string> | null
  declare heldUntil: Date | null
  declare overrideConstraintCapacity: CreationOptional<boolean>
  declare overrideConstraintBuffer: CreationOptional<boolean>
  declare overrideConstraintBlackout: CreationOptional<boolean>
  declare overrideConstraintBusinessHours: CreationOptional<boolean>
  declare submittedAt: Date | null
  declare confirmedAt: Date | null
  declare confirmedBy: ForeignKey<string> | null
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
        type: DataTypes.ENUM(...APPOINTMENT_STATUS_VALUES),
        allowNull: false,
        defaultValue: APPOINTMENT_STATUS_STARTED,
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
      overrideConstraintCapacity: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'override_constraint_capacity',
      },
      overrideConstraintBuffer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'override_constraint_buffer',
      },
      overrideConstraintBlackout: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'override_constraint_blackout',
      },
      overrideConstraintBusinessHours: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'override_constraint_business_hours',
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
      ...manualCreatedUpdatedAtColumns,
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
      Object.assign(plain, linesToFlatSelectionFields(rawLines as AppointmentSelectionLine[]))
    } else {
      Object.assign(plain, emptyFlatSelectionFields())
    }
    plain.overrideConstraints = overrideConstraintsObjectFromBooleans(
      plain as {
        overrideConstraintCapacity?: boolean
        overrideConstraintBuffer?: boolean
        overrideConstraintBlackout?: boolean
        overrideConstraintBusinessHours?: boolean
      }
    )
    stripOverrideConstraintVirtualKeysFromPlain(plain)

    const rawTimeSlots = plain.timeSlots
    delete plain.timeSlots
    plain.selectedTimeSlots =
      Array.isArray(rawTimeSlots) && rawTimeSlots.length > 0
        ? rowsToLegacySelectedTimeSlots(rawTimeSlots as AppointmentTimeSlot[])
        : null

    const pv = plain.propertyVersion
    plain.propertyDetails = propertyDetailsApiShapeFromPropertyVersionJson(pv)

    return plain
  }

  return Appointment
}
