/**
 * WHY: Singleton row storing operator overrides: canonical user_role → block_instance_id (JSONB).
 * Session 6.18.2.1 — see userTypeMapping.getUserTypeBlockIdForRole (override before name map).
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize'

export class UserRoleBlockAlignment extends Model<
  InferAttributes<UserRoleBlockAlignment>,
  InferCreationAttributes<UserRoleBlockAlignment>
> {
  declare id: CreationOptional<string>
  declare alignments: Record<string, string | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export function UserRoleBlockAlignmentFactory(sequelize: Sequelize): typeof UserRoleBlockAlignment {
  UserRoleBlockAlignment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      alignments: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
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
      modelName: 'UserRoleBlockAlignment',
      tableName: 'user_role_block_alignments',
      timestamps: true,
      underscored: true,
    }
  )
  return UserRoleBlockAlignment
}
