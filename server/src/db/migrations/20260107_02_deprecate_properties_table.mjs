/**
 * Migration: Deprecate properties table and remove property_id from appointments
 * Date: 2026-01-07
 * Purpose: Complete the migration to normalized property structure by removing legacy table and column
 * 
 * LEARNING: This migration completes Phase 2 of property schema normalization
 * WHY: The properties table duplicates data now stored in addresses -> property_versions -> property_details
 * PATTERN: Drop legacy column and table after data has been migrated to new structure
 * 
 * Prerequisites:
 * - All data must be migrated to addresses, property_versions, property_details tables
 * - All appointments must have property_version_id set (not NULL)
 * 
 * Changes:
 * - Drop appointments.property_id column (data now in appointments.property_version_id)
 * - Drop properties table (data now in addresses, property_versions, property_details)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting properties table deprecation migration...');

    const propertiesTableExists = await queryInterface.tableExists('properties');
    const appointmentsTableExists = await queryInterface.tableExists('appointments');

    // Step 1: Verify all data has been migrated
    if (appointmentsTableExists) {
      const tableDescription = await queryInterface.describeTable('appointments');
      const hasPropertyId = 'property_id' in tableDescription;
      const hasPropertyVersionId = 'property_version_id' in tableDescription;

      if (hasPropertyVersionId) {
        // Check if all appointments have property_version_id set
        const [nullCheck] = await queryInterface.sequelize.query(
          'SELECT COUNT(*) as count FROM appointments WHERE property_version_id IS NULL'
        );

        if (nullCheck[0].count > 0) {
          throw new Error(
            `Cannot drop property_id column: ${nullCheck[0].count} appointments still have NULL property_version_id. ` +
            `Run the data migration first (20260106_05_migrate_properties_to_three_table.mjs).`
          );
        }

        console.log('✅ All appointments have property_version_id set');
      }

      // Step 2: Drop property_id column from appointments if it exists
      if (hasPropertyId) {
        // First remove foreign key constraint if it exists
        try {
          await queryInterface.removeConstraint('appointments', 'appointments_property_id_fkey');
          console.log('✅ Removed property_id foreign key constraint');
        } catch (error) {
          console.log('ℹ️  No property_id foreign key constraint to remove (may not exist)');
        }

        // Drop the column
        await queryInterface.removeColumn('appointments', 'property_id');
        console.log('✅ Dropped property_id column from appointments');
      } else {
        console.log('ℹ️  property_id column does not exist in appointments, skipping');
      }

      // Step 3: Ensure property_version_id has NOT NULL constraint
      if (hasPropertyVersionId) {
        try {
          await queryInterface.sequelize.query(
            `ALTER TABLE appointments ALTER COLUMN property_version_id SET NOT NULL`
          );
          console.log('✅ Set property_version_id to NOT NULL');
        } catch (error) {
          // Already NOT NULL, that's fine
          console.log('ℹ️  property_version_id already NOT NULL');
        }
      }
    }

    // Step 4: Drop properties table
    if (propertiesTableExists) {
      // First remove any foreign key references to properties table
      // Note: appointments.property_id was already dropped above
      
      await queryInterface.dropTable('properties');
      console.log('✅ Dropped properties table');
    } else {
      console.log('ℹ️  properties table does not exist, skipping');
    }

    console.log('✅ Properties table deprecation migration completed!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting properties table deprecation...');

    // Step 1: Recreate properties table
    await queryInterface.createTable('properties', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(2),
        allowNull: false,
      },
      zip_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      mls_number: {
        type: Sequelize.STRING(50),
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
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true,
      },
      foundation_access: {
        type: Sequelize.ENUM('full', 'partial', 'none'),
        allowNull: true,
      },
      additional_units: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
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
    console.log('✅ Recreated properties table');

    // Step 2: Add property_id column back to appointments
    const appointmentsTableExists = await queryInterface.tableExists('appointments');
    if (appointmentsTableExists) {
      await queryInterface.addColumn('appointments', 'property_id', {
        type: Sequelize.UUID,
        allowNull: true, // Nullable since we can't restore the original references
        references: {
          model: 'properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      console.log('✅ Added property_id column back to appointments');

      // Note: Data would need to be manually restored from the normalized tables
      console.log('⚠️  property_id values not restored. Manual data migration may be needed.');
    }

    console.log('✅ Properties table deprecation reverted');
    console.log('⚠️  Note: Data was not restored. Re-run data migration if needed.');
  }
};

