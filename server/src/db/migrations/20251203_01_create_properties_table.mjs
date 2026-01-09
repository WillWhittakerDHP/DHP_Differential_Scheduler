/**
 * Migration: Create properties table
 * Date: 2025-12-03
 * Purpose: Create properties table for storing property information (address, MLS data, property details)
 * 
 * LEARNING: Properties are referenced by appointments via foreign key
 * WHY: Separate property data from appointment data for normalization and reuse
 * PATTERN: UUID primary key, JSONB for flexible property details, ENUM for foundation_access
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('properties');
    
    if (!tableExists) {
      // Create foundation_access ENUM type
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE foundation_access_enum AS ENUM ('basement', 'crawlspace', 'slab');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create properties table
      await queryInterface.createTable('properties', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        unit: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        zip_code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        mls_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        square_footage: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        bedrooms: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        bathrooms: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        foundation_access: {
          type: Sequelize.ENUM('basement', 'crawlspace', 'slab'),
          allowNull: true,
        },
        additional_units: {
          type: Sequelize.INTEGER,
          allowNull: true,
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
      await queryInterface.addIndex('properties', ['city'], {
        name: 'idx_properties_city',
      });

      await queryInterface.addIndex('properties', ['state'], {
        name: 'idx_properties_state',
      });

      await queryInterface.addIndex('properties', ['mls_number'], {
        name: 'idx_properties_mls_number',
        unique: false,
      });

      console.log('✅ Created properties table with indexes');
    } else {
      console.log('ℹ️  Table properties already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('properties');
    
    if (tableExists) {
      // Remove indexes
      try {
        await queryInterface.removeIndex('properties', 'idx_properties_mls_number');
        await queryInterface.removeIndex('properties', 'idx_properties_state');
        await queryInterface.removeIndex('properties', 'idx_properties_city');
      } catch (e) {
        console.log('   ℹ️  Some indexes may not exist');
      }

      // Drop table
      await queryInterface.dropTable('properties');
      console.log('✅ Removed properties table');

      // Drop ENUM type
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS foundation_access_enum;');
      console.log('✅ Removed foundation_access_enum type');
    }
  }
};

