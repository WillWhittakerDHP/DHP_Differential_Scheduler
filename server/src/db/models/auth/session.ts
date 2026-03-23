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

export class Session extends Model<
  InferAttributes<Session>,
  InferCreationAttributes<Session>
> {
  declare sid: string;
  declare sess: CreationOptional<Record<string, unknown>>;
  declare expire: Date;
  declare userId: ForeignKey<string> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function SessionFactory(sequelize: Sequelize): typeof Session {
  Session.init(
    {
      sid: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      sess: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      expire: {
        type: DataTypes.DATE,
        allowNull: false,
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
      ...manualCreatedUpdatedAtColumns,
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'session',
      tableName: 'sessions',
      freezeTableName: true,
    }
  );

  return Session;
}
