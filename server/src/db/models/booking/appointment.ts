import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

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
  declare id: CreationOptional<string>;
  declare propertyVersionId: ForeignKey<string>; // References normalized property_versions table
  declare userTypeId: ForeignKey<string> | null;
  declare selectedServiceIds: string[] | null; // JSONB array - replaces baseServiceId
  declare serviceQuantities: Record<string, number> | null; // JSONB object - quantity multipliers for services
  declare selectedPropertyIds: string[] | null; // JSONB array - replaces selectedDwellingAdjustmentIds (Property block shape)
  declare propertyQuantities: Record<string, number> | null; // JSONB object - quantity multipliers for property type blocks
  declare selectedOptionIds: string[] | null; // JSONB array - replaces selectedAvailabilityOptions (Option block shape)
  declare optionQuantities: Record<string, number> | null; // JSONB object - quantity multipliers for availability options
  declare serviceSnapshotIds: string[] | null; // UUID array - references block_instance_versions for selected services
  declare propertySnapshotIds: string[] | null; // UUID array - references block_instance_versions for selected property type blocks
  declare optionSnapshotIds: string[] | null; // UUID array - references block_instance_versions for selected availability options
  declare selectedDate: Date | null;
  declare selectedDateRangeEnd: Date | null;
  declare selectedTimeSlots: Array<Record<string, unknown>> | null;
  declare isQuoteMode: boolean;
  declare quotePdfUrl: string | null;
  declare status: 'started' | 'held' | 'rescheduling' | 'quoted' | 'submitted' | 'confirmed' | 'cancelled' | 'deleted';
  /** Tracks which user engaged/interacted with the scheduler to create this appointment */
  declare scheduledById: ForeignKey<string> | null;
  /** FK → users.id — who placed the hold (populated when status = 'held') */
  declare heldBy: ForeignKey<string> | null;
  /** When the hold expires (populated when status = 'held') */
  declare heldUntil: Date | null;
  /** JSONB — which slot-computation constraints are bypassed by admin override (populated via PATCH) */
  declare overrideConstraints: Record<string, boolean> | null;
  /** When the appointment transitioned to 'submitted' status */
  declare submittedAt: Date | null;
  /** When the appointment transitioned to 'confirmed' status */
  declare confirmedAt: Date | null;
  /** FK → users.id — who confirmed the appointment (populated by Feature 7 auth) */
  declare confirmedBy: ForeignKey<string> | null;
  declare propertyDetails: Record<string, unknown> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
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
        allowNull: false, // Required - references normalized property_versions table
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
      selectedServiceIds: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'selected_service_ids',
        comment: 'Array of block instance IDs for selected services (replaces base_service_id)',
      },
      serviceQuantities: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'service_quantities',
        comment: 'Quantity multipliers for selected services (item_id -> quantity mapping)',
      },
      selectedPropertyIds: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'selected_property_ids',
        comment: 'Array of block instance IDs for selected property type blocks (Property block shape)',
      },
      propertyQuantities: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'property_quantities',
        comment: 'Quantity multipliers for selected property type blocks (item_id -> quantity mapping)',
      },
      selectedOptionIds: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'selected_option_ids',
        comment: 'Array of block instance IDs for selected availability options (Option block shape)',
      },
      optionQuantities: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'option_quantities',
        comment: 'Quantity multipliers for selected availability options (item_id -> quantity mapping)',
      },
      serviceSnapshotIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true,
        field: 'service_snapshot_ids',
        comment: 'Array of block_instance_version IDs for selected services',
      },
      propertySnapshotIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true,
        field: 'property_snapshot_ids',
        comment: 'Array of block_instance_version IDs for selected property type blocks',
      },
      optionSnapshotIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true,
        field: 'option_snapshot_ids',
        comment: 'Array of block_instance_version IDs for selected availability options',
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
      /** Tracks which user engaged/interacted with the scheduler to create this appointment */
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
  );

  return Appointment;
}

