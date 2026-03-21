import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export type AppSettingNamespace = 'availability' | 'calendar' | 'wizard'

export class AppSettingEntry extends Model<
  InferAttributes<AppSettingEntry>,
  InferCreationAttributes<AppSettingEntry>
> {
  declare id: CreationOptional<string>
  declare namespace: AppSettingNamespace
  declare path: string
  declare valueJsonb: object
  declare schemaVersion: CreationOptional<number>
  declare updatedAt: CreationOptional<Date>
}

export function AppSettingEntryFactory(sequelize: Sequelize) {
  AppSettingEntry.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      namespace: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      valueJsonb: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: 'value_jsonb',
      },
      schemaVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'schema_version',
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
      modelName: 'app_setting_entries',
      tableName: 'app_setting_entries',
      freezeTableName: true,
    }
  )

  return AppSettingEntry
}
