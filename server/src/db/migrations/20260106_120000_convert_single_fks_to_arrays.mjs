/**
 * Migration: Convert single FK columns to JSONB arrays
 * Date: 2026-01-06
 * Purpose: Convert base_service_id and dwelling_adjustment_id FK columns to JSONB arrays
 *          (selected_service_ids, selected_dwelling_adjustment_ids) to support multi-select
 * 
 * LEARNING: Converting single foreign keys to JSONB arrays enables multi-select functionality
 * WHY: Allows users to select multiple services and dwelling adjustments per appointment
 * PATTERN: Add new columns, migrate data (single values → arrays), drop old columns, add indexes
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('ℹ️  Appointments table does not exist, skipping');
      return;
    }

    const tableDescription = await queryInterface.describeTable('appointments');
    const hasSelectedServiceIds = 'selected_service_ids' in tableDescription;
    const hasSelectedDwellingAdjustmentIds = 'selected_dwelling_adjustment_ids' in tableDescription;
    const hasBaseServiceId = 'base_service_id' in tableDescription;
    const hasDwellingAdjustmentId = 'dwelling_adjustment_id' in tableDescription;

    // Check if migration already applied
    if (hasSelectedServiceIds && hasSelectedDwellingAdjustmentIds) {
      console.log('ℹ️  JSONB array columns already exist, skipping');
      return;
    }

    // Start transaction for atomic operation
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Starting FK to JSONB array migration...');

      // Step 1: Add new JSONB columns
      if (!hasSelectedServiceIds) {
        await queryInterface.addColumn('appointments', 'selected_service_ids', {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Array of block instance IDs for selected services (replaces base_service_id)',
        }, { transaction });
        console.log('✅ Added selected_service_ids column');
      }

      if (!hasSelectedDwellingAdjustmentIds) {
        await queryInterface.addColumn('appointments', 'selected_dwelling_adjustment_ids', {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Array of block instance IDs for selected dwelling adjustments (replaces dwelling_adjustment_id)',
        }, { transaction });
        console.log('✅ Added selected_dwelling_adjustment_ids column');
      }

      // Step 2: Migrate existing data (single FK values → single-item arrays)
      if (hasBaseServiceId) {
        // Migrate base_service_id → selected_service_ids
        await queryInterface.sequelize.query(
          `UPDATE appointments 
           SET selected_service_ids = CASE 
             WHEN base_service_id IS NOT NULL THEN jsonb_build_array(base_service_id::text)
             ELSE NULL
           END`,
          { transaction }
        );
        console.log('✅ Migrated base_service_id → selected_service_ids');
      }

      if (hasDwellingAdjustmentId) {
        // Migrate dwelling_adjustment_id → selected_dwelling_adjustment_ids
        await queryInterface.sequelize.query(
          `UPDATE appointments 
           SET selected_dwelling_adjustment_ids = CASE 
             WHEN dwelling_adjustment_id IS NOT NULL THEN jsonb_build_array(dwelling_adjustment_id::text)
             ELSE NULL
           END`,
          { transaction }
        );
        console.log('✅ Migrated dwelling_adjustment_id → selected_dwelling_adjustment_ids');
      }

      // Step 3: Verify data migration
      const [serviceMigrationCheck] = await queryInterface.sequelize.query(
        `SELECT 
           COUNT(*) FILTER (WHERE base_service_id IS NOT NULL AND selected_service_ids IS NULL) as unmigrated_services,
           COUNT(*) FILTER (WHERE base_service_id IS NULL AND selected_service_ids IS NOT NULL) as incorrectly_migrated_services
         FROM appointments`,
        { transaction }
      );

      const [dwellingMigrationCheck] = await queryInterface.sequelize.query(
        `SELECT 
           COUNT(*) FILTER (WHERE dwelling_adjustment_id IS NOT NULL AND selected_dwelling_adjustment_ids IS NULL) as unmigrated_dwellings,
           COUNT(*) FILTER (WHERE dwelling_adjustment_id IS NULL AND selected_dwelling_adjustment_ids IS NOT NULL) as incorrectly_migrated_dwellings
         FROM appointments`,
        { transaction }
      );

      if (serviceMigrationCheck[0].unmigrated_services > 0 || serviceMigrationCheck[0].incorrectly_migrated_services > 0) {
        throw new Error(`Data migration verification failed for services: ${JSON.stringify(serviceMigrationCheck[0])}`);
      }

      if (dwellingMigrationCheck[0].unmigrated_dwellings > 0 || dwellingMigrationCheck[0].incorrectly_migrated_dwellings > 0) {
        throw new Error(`Data migration verification failed for dwelling adjustments: ${JSON.stringify(dwellingMigrationCheck[0])}`);
      }

      console.log('✅ Data migration verification passed');

      // Step 4: Drop old indexes
      if (hasBaseServiceId) {
        try {
          await queryInterface.removeIndex('appointments', 'idx_appointments_base_service_id', { transaction });
          console.log('✅ Removed idx_appointments_base_service_id index');
        } catch (e) {
          console.log('   ℹ️  Index idx_appointments_base_service_id may not exist');
        }
      }

      if (hasDwellingAdjustmentId) {
        try {
          await queryInterface.removeIndex('appointments', 'idx_appointments_dwelling_adjustment_id', { transaction });
          console.log('✅ Removed idx_appointments_dwelling_adjustment_id index');
        } catch (e) {
          console.log('   ℹ️  Index idx_appointments_dwelling_adjustment_id may not exist');
        }
      }

      // Step 5: Drop old foreign key constraints
      if (hasBaseServiceId) {
        await queryInterface.sequelize.query(
          `ALTER TABLE appointments
           DROP CONSTRAINT IF EXISTS appointments_base_service_id_fkey;`,
          { transaction }
        );
        console.log('✅ Removed base_service_id foreign key constraint');
      }

      if (hasDwellingAdjustmentId) {
        await queryInterface.sequelize.query(
          `ALTER TABLE appointments
           DROP CONSTRAINT IF EXISTS appointments_dwelling_adjustment_id_fkey;`,
          { transaction }
        );
        console.log('✅ Removed dwelling_adjustment_id foreign key constraint');
      }

      // Step 6: Drop old FK columns
      if (hasBaseServiceId) {
        await queryInterface.removeColumn('appointments', 'base_service_id', { transaction });
        console.log('✅ Removed base_service_id column');
      }

      if (hasDwellingAdjustmentId) {
        await queryInterface.removeColumn('appointments', 'dwelling_adjustment_id', { transaction });
        console.log('✅ Removed dwelling_adjustment_id column');
      }

      // Step 7: Add GIN indexes on JSONB columns
      await queryInterface.addIndex('appointments', ['selected_service_ids'], {
        name: 'idx_appointments_selected_service_ids',
        using: 'gin',
        transaction,
      });
      console.log('✅ Added GIN index on selected_service_ids');

      await queryInterface.addIndex('appointments', ['selected_dwelling_adjustment_ids'], {
        name: 'idx_appointments_selected_dwelling_adjustment_ids',
        using: 'gin',
        transaction,
      });
      console.log('✅ Added GIN index on selected_dwelling_adjustment_ids');

      await transaction.commit();
      console.log('✅ Successfully converted FK columns to JSONB arrays');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error converting FK columns to JSONB arrays:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('ℹ️  Appointments table does not exist, skipping rollback');
      return;
    }

    const tableDescription = await queryInterface.describeTable('appointments');
    const hasSelectedServiceIds = 'selected_service_ids' in tableDescription;
    const hasSelectedDwellingAdjustmentIds = 'selected_dwelling_adjustment_ids' in tableDescription;
    const hasBaseServiceId = 'base_service_id' in tableDescription;
    const hasDwellingAdjustmentId = 'dwelling_adjustment_id' in tableDescription;

    if (!hasSelectedServiceIds && !hasSelectedDwellingAdjustmentIds) {
      console.log('ℹ️  JSONB array columns do not exist, skipping rollback');
      return;
    }

    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Rolling back JSONB arrays to FK columns...');

      // Step 1: Drop GIN indexes
      try {
        await queryInterface.removeIndex('appointments', 'idx_appointments_selected_service_ids', { transaction });
        console.log('✅ Removed GIN index on selected_service_ids');
      } catch (e) {
        console.log('   ℹ️  Index idx_appointments_selected_service_ids may not exist');
      }

      try {
        await queryInterface.removeIndex('appointments', 'idx_appointments_selected_dwelling_adjustment_ids', { transaction });
        console.log('✅ Removed GIN index on selected_dwelling_adjustment_ids');
      } catch (e) {
        console.log('   ℹ️  Index idx_appointments_selected_dwelling_adjustment_ids may not exist');
      }

      // Step 2: Restore FK columns
      if (!hasBaseServiceId) {
        await queryInterface.addColumn('appointments', 'base_service_id', {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'base_service_id',
          references: {
            model: 'block_instances',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
        console.log('✅ Restored base_service_id column');
      }

      if (!hasDwellingAdjustmentId) {
        await queryInterface.addColumn('appointments', 'dwelling_adjustment_id', {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'dwelling_adjustment_id',
          references: {
            model: 'block_instances',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
        console.log('✅ Restored dwelling_adjustment_id column');
      }

      // Step 3: Restore data (extract first element from arrays)
      if (hasSelectedServiceIds && !hasBaseServiceId) {
        await queryInterface.sequelize.query(
          `UPDATE appointments 
           SET base_service_id = CASE 
             WHEN selected_service_ids IS NOT NULL AND jsonb_array_length(selected_service_ids) > 0 
             THEN (selected_service_ids->0)::uuid
             ELSE NULL
           END`,
          { transaction }
        );
        console.log('✅ Restored base_service_id from selected_service_ids');
      }

      if (hasSelectedDwellingAdjustmentIds && !hasDwellingAdjustmentId) {
        await queryInterface.sequelize.query(
          `UPDATE appointments 
           SET dwelling_adjustment_id = CASE 
             WHEN selected_dwelling_adjustment_ids IS NOT NULL AND jsonb_array_length(selected_dwelling_adjustment_ids) > 0 
             THEN (selected_dwelling_adjustment_ids->0)::uuid
             ELSE NULL
           END`,
          { transaction }
        );
        console.log('✅ Restored dwelling_adjustment_id from selected_dwelling_adjustment_ids');
      }

      // Step 4: Restore indexes
      if (!hasBaseServiceId) {
        await queryInterface.addIndex('appointments', ['base_service_id'], {
          name: 'idx_appointments_base_service_id',
          transaction,
        });
        console.log('✅ Restored idx_appointments_base_service_id index');
      }

      if (!hasDwellingAdjustmentId) {
        await queryInterface.addIndex('appointments', ['dwelling_adjustment_id'], {
          name: 'idx_appointments_dwelling_adjustment_id',
          transaction,
        });
        console.log('✅ Restored idx_appointments_dwelling_adjustment_id index');
      }

      // Step 5: Drop JSONB columns
      if (hasSelectedServiceIds) {
        await queryInterface.removeColumn('appointments', 'selected_service_ids', { transaction });
        console.log('✅ Removed selected_service_ids column');
      }

      if (hasSelectedDwellingAdjustmentIds) {
        await queryInterface.removeColumn('appointments', 'selected_dwelling_adjustment_ids', { transaction });
        console.log('✅ Removed selected_dwelling_adjustment_ids column');
      }

      await transaction.commit();
      console.log('✅ Successfully rolled back JSONB arrays to FK columns');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error rolling back JSONB arrays to FK columns:', error);
      throw error;
    }
  }
};

