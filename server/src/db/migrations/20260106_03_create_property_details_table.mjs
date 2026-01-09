/**
 * Migration: Create property_details table
 * Date: 2026-01-06
 * Purpose: Create property_details table for storing versioned property details from API or manual input
 * 
 * LEARNING: PropertyDetails stores versioned data that may change over time
 * WHY: Allows disambiguation (different sources, different values), manual overrides without mutating API data
 * PATTERN: UUID primary key, foreign key to property_versions, source tracking, versioned fields
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('property_details');
    
    if (!tableExists) {
      // Check if property_versions table exists
      const propertyVersionsTableExists = await queryInterface.tableExists('property_versions');
      if (!propertyVersionsTableExists) {
        throw new Error('Property_versions table must exist before creating property_details table');
      }

      // Create source ENUM type
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE property_details_source_enum AS ENUM ('api', 'manual', 'client');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create foundation_access ENUM type (reuse if exists)
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE foundation_access_enum AS ENUM ('basement', 'crawlspace', 'slab');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create property_details table
      await queryInterface.createTable('property_details', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        property_version_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'property_versions',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Foreign key to property_versions table',
        },
        source: {
          type: Sequelize.ENUM('api', 'manual', 'client'),
          allowNull: false,
          defaultValue: 'client',
          comment: 'Source of data: api (MLS API), manual (admin input), client (booking wizard)',
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
      await queryInterface.addIndex('property_details', ['property_version_id'], {
        name: 'idx_property_details_property_version_id',
      });

      await queryInterface.addIndex('property_details', ['source'], {
        name: 'idx_property_details_source',
      });

      await queryInterface.addIndex('property_details', ['mls_number'], {
        name: 'idx_property_details_mls_number',
        unique: false,
      });

      console.log('✅ Created property_details table with indexes');
    } else {
      console.log('ℹ️  Table property_details already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('property_details');
    
    if (tableExists) {
      // Remove indexes
      try {
        await queryInterface.removeIndex('property_details', 'idx_property_details_mls_number');
        await queryInterface.removeIndex('property_details', 'idx_property_details_source');
        await queryInterface.removeIndex('property_details', 'idx_property_details_property_version_id');
      } catch (e) {
        console.log('   ℹ️  Some indexes may not exist');
      }

      // Drop table
      await queryInterface.dropTable('property_details');
      console.log('✅ Removed property_details table');

      // Drop ENUM types (only if not used elsewhere)
      // Note: foundation_access_enum may be used by properties table, so check first
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS property_details_source_enum;');
      console.log('✅ Removed property_details_source_enum type');
    }
  }
};

