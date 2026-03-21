import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

export class AdminPrimitiveMetadataSelectOption extends Model<
  InferAttributes<AdminPrimitiveMetadataSelectOption>,
  InferCreationAttributes<AdminPrimitiveMetadataSelectOption>
> {
  declare id: CreationOptional<string>;
  declare primitiveMetadataId: string;
  declare displayOrder: number;
  declare label: string;
  declare valuePayload: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function AdminPrimitiveMetadataSelectOptionFactory(sequelize: Sequelize) {
  AdminPrimitiveMetadataSelectOption.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      primitiveMetadataId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'primitive_metadata_id',
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
      indexes: [
        {
          fields: ['primitive_metadata_id'],
          name: 'admin_primitive_metadata_select_options_meta_idx',
        },
      ],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'admin_primitive_metadata_select_options',
      tableName: 'admin_primitive_metadata_select_options',
      freezeTableName: true,
    }
  );

  return AdminPrimitiveMetadataSelectOption;
}
