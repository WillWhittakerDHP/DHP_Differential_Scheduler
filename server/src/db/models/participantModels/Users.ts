import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare phone: string | null;
  declare userRole: 'client' | 'agent' | 'transaction_manager' | 'seller';
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
        // LEARNING: Allow duplicate emails in development for testing
        // WHY: Makes it easier to create test users without worrying about unique emails
        unique: process.env.NODE_ENV !== 'development',
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userRole: {
        type: DataTypes.ENUM('client', 'agent', 'transaction_manager', 'seller', 'inspector'),
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
