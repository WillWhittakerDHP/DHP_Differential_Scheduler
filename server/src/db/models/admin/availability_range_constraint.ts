import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class AvailabilityRangeConstraint extends Model<
  InferAttributes<AvailabilityRangeConstraint>,
  InferCreationAttributes<AvailabilityRangeConstraint>
> {
  declare id: CreationOptional<string>
  declare availabilitySettingsId: string
  declare rangeType: string
  declare enforcement: string
  declare leadTimeMinutes: CreationOptional<number | null>
  declare dateRangeStart: CreationOptional<Date | null>
  declare dateRangeEnd: CreationOptional<Date | null>
}

export function AvailabilityRangeConstraintFactory(sequelize: Sequelize) {
  AvailabilityRangeConstraint.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      availabilitySettingsId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'availability_settings_id',
      },
      rangeType: { type: DataTypes.STRING, allowNull: false, field: 'range_type' },
      enforcement: { type: DataTypes.STRING, allowNull: false },
      leadTimeMinutes: { type: DataTypes.INTEGER, allowNull: true, field: 'lead_time_minutes' },
      dateRangeStart: { type: DataTypes.DATE, allowNull: true, field: 'date_range_start' },
      dateRangeEnd: { type: DataTypes.DATE, allowNull: true, field: 'date_range_end' },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'availability_range_constraints',
      tableName: 'availability_range_constraints',
      freezeTableName: true,
    }
  )
  return AvailabilityRangeConstraint
}
