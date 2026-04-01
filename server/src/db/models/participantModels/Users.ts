import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';
import { NODE_ENV } from '../../../constants/appConstants.js';
import { USER_ROLE_VALUES, type UserRoleValue } from '../../../constants/userRoles.js';
import { manualCreatedUpdatedAtColumns } from '../shared/manualCreatedUpdatedAtColumns.js';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare phone: string | null;
  declare userRole: UserRoleValue;
  declare loginId: ForeignKey<number> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function UserFactory(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: process.env.NODE_ENV !== NODE_ENV.DEVELOPMENT,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userRole: {
        type: DataTypes.ENUM(...USER_ROLE_VALUES),
        allowNull: false,
        field: 'user_role',
      },
      loginId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'login_id',
        references: {
          model: 'login',
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
      modelName: 'user',
      tableName: 'users',
      freezeTableName: true,
    }
  );

  return User;
}
