import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

export class AdminMetadataSelectOption extends Model<
  InferAttributes<AdminMetadataSelectOption>,
  InferCreationAttributes<AdminMetadataSelectOption>
> {
  declare id: CreationOptional<string>;
  declare adminMetadataId: string;
  declare displayOrder: number;
  declare label: string;
  declare valuePayload: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function AdminMetadataSelectOptionFactory(sequelize: Sequelize) {
  AdminMetadataSelectOption.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      adminMetadataId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'admin_metadata_id',
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'display_order',
      },
      label: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      valuePayload: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'value_payload',
        comment: 'JSON text of option value (null/absent for null option value)',
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
      indexes: [{ fields: ['admin_metadata_id'], name: 'admin_metadata_select_options_meta_idx' }],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'admin_metadata_select_options',
      tableName: 'admin_metadata_select_options',
      freezeTableName: true,
    }
  );

  return AdminMetadataSelectOption;
}
