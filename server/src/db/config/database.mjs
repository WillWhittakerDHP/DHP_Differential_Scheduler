import 'dotenv/config';

export default {
  // @audit-allow:constants-consolidation:hoist - Sequelize CLI config requires literal object keys per framework convention
  "development": {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'jklJKL',
    database: process.env.DB_NAME || 'scheduler_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false // Disable SQL logging - set to console.log when debugging
  },
  // @audit-allow:constants-consolidation:hoist - Sequelize CLI config requires literal object keys per framework convention
  "test": {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'jklJKL',
    database: process.env.DB_NAME || 'scheduler_db_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  // @audit-allow:constants-consolidation:hoist - Sequelize CLI config requires literal object keys per framework convention
  "production": {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
}