import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
import { buildAdminMetadataSelectOptionAttributes } from './selectOptionSharedColumns.js';

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
    buildAdminMetadataSelectOptionAttributes(sequelize, {
      attribute: 'adminMetadataId',
      column: 'admin_metadata_id',
    }),
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
