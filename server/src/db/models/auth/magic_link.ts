import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';
import { manualCreatedUpdatedAtColumns } from '../shared/manualCreatedUpdatedAtColumns.js';

export class MagicLink extends Model<
  InferAttributes<MagicLink>,
  InferCreationAttributes<MagicLink>
> {
  declare id: CreationOptional<string>;
  declare tokenHash: string;
  declare email: string | null;
  declare userId: ForeignKey<string> | null;
  declare purpose: string | null;
  declare expiresAt: Date;
  declare consumedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function MagicLinkFactory(sequelize: Sequelize): typeof MagicLink {
  MagicLink.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tokenHash: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'token_hash',
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      purpose: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      consumedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'consumed_at',
      },
      ...manualCreatedUpdatedAtColumns,
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'magic_link',
      tableName: 'magic_links',
      freezeTableName: true,
    }
  );

  return MagicLink;
}
