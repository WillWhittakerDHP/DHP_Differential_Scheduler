import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class AvailabilityBufferEntry extends Model<
  InferAttributes<AvailabilityBufferEntry>,
  InferCreationAttributes<AvailabilityBufferEntry>
> {
  declare id: CreationOptional<string>
  declare availabilitySettingsId: string
  declare bufferKind: string
  declare minutes: CreationOptional<number | null>
  declare enforcement: CreationOptional<string | null>
  declare placement: CreationOptional<string | null>
  declare applyTo: CreationOptional<string | null>
}

export function AvailabilityBufferEntryFactory(sequelize: Sequelize) {
  AvailabilityBufferEntry.init(
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
      bufferKind: { type: DataTypes.STRING, allowNull: false, field: 'buffer_kind' },
      minutes: { type: DataTypes.INTEGER, allowNull: true },
      enforcement: { type: DataTypes.STRING, allowNull: true },
      placement: { type: DataTypes.STRING, allowNull: true },
      applyTo: { type: DataTypes.STRING, allowNull: true, field: 'apply_to' },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'availability_buffers',
      tableName: 'availability_buffers',
      freezeTableName: true,
    }
  )
  return AvailabilityBufferEntry
}
