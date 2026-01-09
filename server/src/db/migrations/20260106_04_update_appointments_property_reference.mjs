/**
 * Migration: Update appointments table property reference
 * Date: 2026-01-06
 * Purpose: Change appointments.property_id to appointments.property_version_id, updating foreign key reference
 * 
 * LEARNING: Appointments now reference PropertyVersion instead of Property directly
 * WHY: Enables versioning of property details while maintaining appointment relationships
 * PATTERN: Rename column, update foreign key reference, maintain data integrity
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    const propertyVersionsTableExists = await queryInterface.tableExists('property_versions');
    
    if (!tableExists) {
      console.log('ℹ️  Appointments table does not exist, skipping');
      return;
    }

    if (!propertyVersionsTableExists) {
      throw new Error('Property_versions table must exist before updating appointments reference');
    }

    // Check if property_version_id column already exists
    const tableDescription = await queryInterface.describeTable('appointments');
    const hasPropertyVersionId = 'property_version_id' in tableDescription;
    const hasPropertyId = 'property_id' in tableDescription;

    if (hasPropertyVersionId) {
      console.log('ℹ️  Column property_version_id already exists, skipping');
      return;
    }

    if (!hasPropertyId) {
      console.log('ℹ️  Column property_id does not exist, skipping');
      return;
    }

    // Start transaction for atomic operation
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Step 1: Add new property_version_id column (nullable initially)
      await queryInterface.addColumn('appointments', 'property_version_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'property_versions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      }, { transaction });

      console.log('✅ Added property_version_id column');

      // Step 2: Migrate data from property_id to property_version_id
      // This assumes data migration has already created PropertyVersion records
      // If not, this will be handled by the data migration script
      console.log('ℹ️  Data migration will populate property_version_id in separate migration');

      // Step 3: Remove old index
      try {
        await queryInterface.removeIndex('appointments', 'idx_appointments_property_id', { transaction });
        console.log('✅ Removed old property_id index');
      } catch (e) {
        console.log('   ℹ️  Index idx_appointments_property_id may not exist');
      }

      // Step 4: Remove old foreign key constraint
      // Note: Sequelize doesn't provide direct method, so we use raw SQL
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments
        DROP CONSTRAINT IF EXISTS appointments_property_id_fkey;
      `, { transaction });

      console.log('✅ Removed old property_id foreign key constraint');

      // Step 5: Remove old property_id column (after data migration)
      // Note: We'll keep property_id column for now and remove it in data migration
      // This allows for gradual migration and rollback capability
      console.log('ℹ️  Keeping property_id column until data migration completes');

      // Step 6: Add new index for property_version_id
      await queryInterface.addIndex('appointments', ['property_version_id'], {
        name: 'idx_appointments_property_version_id',
        transaction,
      });

      console.log('✅ Added property_version_id index');

      await transaction.commit();
      console.log('✅ Successfully updated appointments property reference');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error updating appointments property reference:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      console.log('ℹ️  Appointments table does not exist, skipping');
      return;
    }

    const tableDescription = await queryInterface.describeTable('appointments');
    const hasPropertyVersionId = 'property_version_id' in tableDescription;
    const hasPropertyId = 'property_id' in tableDescription;

    if (!hasPropertyVersionId) {
      console.log('ℹ️  Column property_version_id does not exist, skipping rollback');
      return;
    }

    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove new index
      try {
        await queryInterface.removeIndex('appointments', 'idx_appointments_property_version_id', { transaction });
      } catch (e) {
        console.log('   ℹ️  Index idx_appointments_property_version_id may not exist');
      }

      // Remove foreign key constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments
        DROP CONSTRAINT IF EXISTS appointments_property_version_id_fkey;
      `, { transaction });

      // Remove property_version_id column
      await queryInterface.removeColumn('appointments', 'property_version_id', { transaction });

      // Restore property_id column if it was removed
      if (!hasPropertyId) {
        await queryInterface.addColumn('appointments', 'property_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'properties',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        }, { transaction });

        await queryInterface.addIndex('appointments', ['property_id'], {
          name: 'idx_appointments_property_id',
          transaction,
        });
      }

      await transaction.commit();
      console.log('✅ Successfully rolled back appointments property reference');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error rolling back appointments property reference:', error);
      throw error;
    }
  }
};

