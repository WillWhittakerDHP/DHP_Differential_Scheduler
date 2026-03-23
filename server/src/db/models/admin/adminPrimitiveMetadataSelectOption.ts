import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
import { buildAdminMetadataSelectOptionAttributes } from './selectOptionSharedColumns.js';

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
    buildAdminMetadataSelectOptionAttributes(sequelize, {
      attribute: 'primitiveMetadataId',
      column: 'primitive_metadata_id',
    }),
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
