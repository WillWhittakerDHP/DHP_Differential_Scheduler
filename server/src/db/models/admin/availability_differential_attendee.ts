import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class AvailabilityDifferentialAttendee extends Model<
  InferAttributes<AvailabilityDifferentialAttendee>,
  InferCreationAttributes<AvailabilityDifferentialAttendee>
> {
  declare id: CreationOptional<string>
  declare availabilitySettingsId: string
  declare role: string
  declare sortOrder: number
  declare value: string
}

export function AvailabilityDifferentialAttendeeFactory(sequelize: Sequelize) {
  AvailabilityDifferentialAttendee.init(
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
      role: { type: DataTypes.STRING, allowNull: false },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, field: 'sort_order' },
      value: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'availability_differential_attendees',
      tableName: 'availability_differential_attendees',
      freezeTableName: true,
    }
  )
  return AvailabilityDifferentialAttendee
}
