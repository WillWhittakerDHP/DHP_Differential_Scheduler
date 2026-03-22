import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class AvailabilityRangeConstraintHour extends Model<
  InferAttributes<AvailabilityRangeConstraintHour>,
  InferCreationAttributes<AvailabilityRangeConstraintHour>
> {
  declare id: CreationOptional<string>
  declare rangeConstraintId: string
  declare dayOfWeek: number
  declare startAt: Date
  declare endAt: Date
}

export function AvailabilityRangeConstraintHourFactory(sequelize: Sequelize) {
  AvailabilityRangeConstraintHour.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      rangeConstraintId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'range_constraint_id',
      },
      dayOfWeek: { type: DataTypes.SMALLINT, allowNull: false, field: 'day_of_week' },
      startAt: { type: DataTypes.DATE, allowNull: false, field: 'start_at' },
      endAt: { type: DataTypes.DATE, allowNull: false, field: 'end_at' },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'availability_range_constraint_hours',
      tableName: 'availability_range_constraint_hours',
      freezeTableName: true,
    }
  )
  return AvailabilityRangeConstraintHour
}
