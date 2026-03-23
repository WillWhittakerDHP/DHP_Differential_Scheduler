import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';
import { buildAdminMetadataSelectOptionAttributes } from './selectOptionSharedColumns.js';

export class AdminRelationshipMetadataSelectOption extends Model<
  InferAttributes<AdminRelationshipMetadataSelectOption>,
  InferCreationAttributes<AdminRelationshipMetadataSelectOption>
> {
  declare id: CreationOptional<string>;
  declare relationshipMetadataId: string;
  declare displayOrder: number;
  declare label: string;
  declare valuePayload: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function AdminRelationshipMetadataSelectOptionFactory(sequelize: Sequelize) {
  AdminRelationshipMetadataSelectOption.init(
    buildAdminMetadataSelectOptionAttributes(sequelize, {
      attribute: 'relationshipMetadataId',
      column: 'relationship_metadata_id',
    }),
    {
      sequelize,
      indexes: [
        {
          fields: ['relationship_metadata_id'],
          name: 'admin_relationship_metadata_select_options_meta_idx',
        },
      ],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'admin_relationship_metadata_select_options',
      tableName: 'admin_relationship_metadata_select_options',
      freezeTableName: true,
    }
  );

  return AdminRelationshipMetadataSelectOption;
}
