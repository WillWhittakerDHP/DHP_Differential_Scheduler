/**
 * Migration: Create users table
 * Date: 2025-12-03
 * Purpose: Create users table for storing user information (clients, agents, transaction managers, sellers)
 * 
 * LEARNING: Users are referenced by appointments via client_id and agent_id (nullable)
 * WHY: Separate user data from appointment data, support multiple user roles
 * PATTERN: UUID primary key, ENUM for user_role, nullable login_id for future login functionality
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('users');
    
    if (!tableExists) {
      // Create user_role ENUM type
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE user_role_enum AS ENUM ('client', 'agent', 'transaction_manager', 'seller');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Check if logins table exists (for foreign key reference)
      const loginsTableExists = await queryInterface.tableExists('login');

      // Create users table
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        first_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        last_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        user_role: {
          type: Sequelize.ENUM('client', 'agent', 'transaction_manager', 'seller'),
          allowNull: false,
        },
        login_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          ...(loginsTableExists ? {
            references: {
              model: 'login',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          } : {}),
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Create indexes
      await queryInterface.addIndex('users', ['email'], {
        name: 'idx_users_email',
        unique: true,
      });

      await queryInterface.addIndex('users', ['user_role'], {
        name: 'idx_users_user_role',
      });

      if (loginsTableExists) {
        await queryInterface.addIndex('users', ['login_id'], {
          name: 'idx_users_login_id',
        });
      }

      console.log('✅ Created users table with indexes');
    } else {
      console.log('ℹ️  Table users already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('users');
    
    if (tableExists) {
      // Remove indexes
      try {
        const loginsTableExists = await queryInterface.tableExists('login');
        if (loginsTableExists) {
          await queryInterface.removeIndex('users', 'idx_users_login_id');
        }
        await queryInterface.removeIndex('users', 'idx_users_user_role');
        await queryInterface.removeIndex('users', 'idx_users_email');
      } catch (e) {
        console.log('   ℹ️  Some indexes may not exist');
      }

      // Drop table
      await queryInterface.dropTable('users');
      console.log('✅ Removed users table');

      // Drop ENUM type
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS user_role_enum;');
      console.log('✅ Removed user_role_enum type');
    }
  }
};

