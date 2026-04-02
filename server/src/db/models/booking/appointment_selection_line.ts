import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize'

export type AppointmentSelectionLineKind = 'service' | 'time' | 'event'

export class AppointmentSelectionLine extends Model<
  InferAttributes<AppointmentSelectionLine>,
  InferCreationAttributes<AppointmentSelectionLine>
> {
  declare id: CreationOptional<string>
  declare appointmentId: ForeignKey<string>
  declare lineKind: AppointmentSelectionLineKind
  declare sortOrder: number
  declare blockInstanceId: ForeignKey<string>
  declare quantity: CreationOptional<number>
  declare snapshotVersionId: CreationOptional<string | null>
}

export function AppointmentSelectionLineFactory(sequelize: Sequelize) {
  AppointmentSelectionLine.init(
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
        references: { model: 'appointments', key: 'id' },
      },
      lineKind: {
        type: DataTypes.STRING(16),
        allowNull: false,
        field: 'line_kind',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sort_order',
      },
      blockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_instance_id',
        references: { model: 'block_instances', key: 'id' },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      snapshotVersionId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'snapshot_version_id',
        references: { model: 'block_instance_versions', key: 'id' },
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'appointment_selection_line',
      tableName: 'appointment_selection_lines',
      freezeTableName: true,
    }
  )

  return AppointmentSelectionLine
}
