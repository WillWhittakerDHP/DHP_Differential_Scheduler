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
 * Phase 6.8 — Admin Force-Create & Constraint Overrides.
 * Records which slot-computation constraints were overridden when an admin
 * force-creates an appointment on a blocked slot. Used for audit and for
 * reschedule flow (allowedExceptions). authorized_by_id is populated when
 * Feature 7 provides req.user.
 */
export class ConstraintOverride extends Model<
  InferAttributes<ConstraintOverride>,
  InferCreationAttributes<ConstraintOverride>
> {
  declare id: CreationOptional<string>;
  declare appointmentId: ForeignKey<string>;
  /** Violation keys (e.g. range.leadTime, capacity.daily) that were overridden */
  declare overriddenViolations: string[];
  /** Who authorized the override; null until Feature 7 auth */
  declare authorizedById: ForeignKey<string> | null;
  declare reason: string | null;
  declare slotStart: Date;
  declare slotEnd: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function ConstraintOverrideFactory(sequelize: Sequelize) {
  ConstraintOverride.init(
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
        onDelete: 'CASCADE',
      },
      overriddenViolations: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
        field: 'overridden_violations',
      },
      authorizedById: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'authorized_by_id',
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      slotStart: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'slot_start',
      },
      slotEnd: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'slot_end',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'constraint_overrides',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return ConstraintOverride;
}
