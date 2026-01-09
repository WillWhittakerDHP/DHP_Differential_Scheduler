// import { DataTypes, Sequelize, Model, Optional } from 'sequelize';
// import bcrypt from 'bcrypt';

// interface loginAttributes {
//   id: number;
//   password: string;
//   username: string;
// }

// interface LoginCreationAttributes extends Optional<loginAttributes, 'id'> {}

// export class Login extends Model<loginAttributes, LoginCreationAttributes> implements loginAttributes {
//   public id!: number;
//   public password!: string;
//   public username!: string;
//   // Method to hash and set the password for the user
//   public async setPassword(password: string) {
//     const saltRounds = 10;
//     this.password = await bcrypt.hash(password, saltRounds);
//   }
// }

// export function LoginFactory(sequelize: Sequelize): typeof Login {
//   Login.init(
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       password: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       username: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//     },
//     {
//       tableName: 'login',  // Name of the table in PostgreSQL
//       sequelize,            // The Sequelize instance that connects to PostgreSQL
//       hooks: {
//         // Before creating a new user, hash and set the password
//         beforeCreate: async (login: Login) => {
//           await login.setPassword(login.password);
//         },
//         // Before updating a login, hash and set the new password if it has changed
//         beforeUpdate: async (login: Login) => {
//           if (login.changed('password')) {
//             await login.setPassword(login.password);
//           }
//         },
//       }
//     }
//   );

//   return Login;
// }
