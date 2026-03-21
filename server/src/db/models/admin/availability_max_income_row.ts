import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class AvailabilityMaxIncomeRow extends Model<
  InferAttributes<AvailabilityMaxIncomeRow>,
  InferCreationAttributes<AvailabilityMaxIncomeRow>
> {
  declare id: CreationOptional<string>
  declare availabilitySettingsId: string
  declare scope: string
  declare maxIncome: number
  declare enforcement: string
  declare rollingDirection: CreationOptional<string | null>
}

export function AvailabilityMaxIncomeRowFactory(sequelize: Sequelize) {
  AvailabilityMaxIncomeRow.init(
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
      scope: { type: DataTypes.STRING, allowNull: false },
      maxIncome: { type: DataTypes.DOUBLE, allowNull: false, field: 'max_income' },
      enforcement: { type: DataTypes.STRING, allowNull: false },
      rollingDirection: { type: DataTypes.STRING, allowNull: true, field: 'rolling_direction' },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'availability_max_income',
      tableName: 'availability_max_income',
      freezeTableName: true,
    }
  )
  return AvailabilityMaxIncomeRow
}
