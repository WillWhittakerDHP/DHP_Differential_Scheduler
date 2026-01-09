/**
 * Migration: Create business_settings table
 * Date: 2026-01-07
 * Purpose: Create business_settings table for storing admin-configurable business logic settings
 * 
 * LEARNING: Business settings stored as key-value pairs with JSONB for flexible configuration
 * WHY: Allows admin to configure availability settings (business hours, time increments, lead time) without code changes
 * PATTERN: Single record pattern with setting_key "availability_settings" storing AvailabilitySettings JSONB object
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_settings');
    
    if (!tableExists) {
      // Create business_settings table
      await queryInterface.createTable('business_settings', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
          allowNull: false,
        },
        setting_key: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          comment: 'Unique key identifying the setting (e.g., "availability_settings")',
        },
        setting_value: {
          type: Sequelize.JSONB,
          allowNull: false,
          comment: 'JSONB object containing the setting configuration',
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

      // Create index on setting_key for fast lookups
      await queryInterface.addIndex('business_settings', ['setting_key'], {
        name: 'idx_business_settings_setting_key',
        unique: true,
      });

      console.log('✅ Created business_settings table with index');
    } else {
      console.log('ℹ️  Table business_settings already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_settings');
    
    if (tableExists) {
      // Remove index
      try {
        await queryInterface.removeIndex('business_settings', 'idx_business_settings_setting_key');
      } catch (e) {
        console.log('   ℹ️  Index may not exist');
      }

      // Drop table
      await queryInterface.dropTable('business_settings');
      console.log('✅ Removed business_settings table');
    }
  }
};

