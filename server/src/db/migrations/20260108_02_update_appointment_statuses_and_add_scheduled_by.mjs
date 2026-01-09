/**
 * Migration: Update appointment statuses and add scheduled_by_id
 * Date: 2026-01-08
 * Purpose: 
 *   1. Replace existing status ENUM with new workflow statuses
 *   2. Add scheduled_by_id column to track which user engaged the scheduler
 * 
 * LEARNING: PostgreSQL ENUM alteration requires creating new type and migrating
 * WHY: New appointment workflow with 8 statuses replacing original 5
 * PATTERN: Safe ENUM migration with data transformation
 * 
 * Status Migration Mapping:
 *   - draft -> started
 *   - quote -> quoted
 *   - booked -> submitted
 *   - completed -> confirmed
 *   - cancelled -> cancelled
 * 
 * New Statuses:
 *   - started: Non-quote mode appointment creation in progress
 *   - held: Time slots held for clients who paid booking fee (TODO: future logic)
 *   - rescheduling: Non-quote mode rescheduling in progress
 *   - quoted: Quote mode appointment creation in progress
 *   - submitted: Submitted through app, awaiting confirmation (TODO: confirmation routine)
 *   - confirmed: Submitted and confirmed
 *   - cancelled: Soft-delete, still reschedulable
 *   - deleted: Hard-delete
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Step 1: Create the new ENUM type with all new status values
      await queryInterface.sequelize.query(`
        CREATE TYPE appointment_status_enum_new AS ENUM (
          'started',
          'held',
          'rescheduling',
          'quoted',
          'submitted',
          'confirmed',
          'cancelled',
          'deleted'
        );
      `, { transaction });
      console.log('✅ Created new appointment_status_enum_new type');

      // Step 2: Add a temporary column with the new type
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments 
        ADD COLUMN status_new appointment_status_enum_new;
      `, { transaction });
      console.log('✅ Added temporary status_new column');

      // Step 3: Migrate existing data to new status values
      await queryInterface.sequelize.query(`
        UPDATE appointments SET status_new = CASE
          WHEN status = 'draft' THEN 'started'::appointment_status_enum_new
          WHEN status = 'quote' THEN 'quoted'::appointment_status_enum_new
          WHEN status = 'booked' THEN 'submitted'::appointment_status_enum_new
          WHEN status = 'completed' THEN 'confirmed'::appointment_status_enum_new
          WHEN status = 'cancelled' THEN 'cancelled'::appointment_status_enum_new
          ELSE 'started'::appointment_status_enum_new
        END;
      `, { transaction });
      console.log('✅ Migrated existing status values to new statuses');

      // Step 4: Drop the old status column
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments DROP COLUMN status;
      `, { transaction });
      console.log('✅ Dropped old status column');

      // Step 5: Rename the new column to status
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments RENAME COLUMN status_new TO status;
      `, { transaction });
      console.log('✅ Renamed status_new to status');

      // Step 6: Set NOT NULL constraint and default value
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments 
        ALTER COLUMN status SET NOT NULL,
        ALTER COLUMN status SET DEFAULT 'started'::appointment_status_enum_new;
      `, { transaction });
      console.log('✅ Set NOT NULL and default for status column');

      // Step 7: Drop the old ENUM type
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS appointment_status_enum;
      `, { transaction });
      console.log('✅ Dropped old appointment_status_enum type');

      // Step 8: Rename the new ENUM type to the original name
      await queryInterface.sequelize.query(`
        ALTER TYPE appointment_status_enum_new RENAME TO appointment_status_enum;
      `, { transaction });
      console.log('✅ Renamed appointment_status_enum_new to appointment_status_enum');

      // Step 9: Add scheduled_by_id column
      const usersTableExists = await queryInterface.tableExists('users');
      
      await queryInterface.addColumn('appointments', 'scheduled_by_id', {
        type: Sequelize.UUID,
        allowNull: true,
        ...(usersTableExists ? {
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        } : {}),
      }, { transaction });
      console.log('✅ Added scheduled_by_id column');

      // Step 10: Add index for scheduled_by_id
      await queryInterface.addIndex('appointments', ['scheduled_by_id'], {
        name: 'idx_appointments_scheduled_by_id',
        transaction,
      });
      console.log('✅ Added index for scheduled_by_id');

      await transaction.commit();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Step 1: Remove index for scheduled_by_id
      try {
        await queryInterface.removeIndex('appointments', 'idx_appointments_scheduled_by_id', { transaction });
        console.log('✅ Removed index for scheduled_by_id');
      } catch (e) {
        console.log('ℹ️  Index idx_appointments_scheduled_by_id may not exist');
      }

      // Step 2: Remove scheduled_by_id column
      await queryInterface.removeColumn('appointments', 'scheduled_by_id', { transaction });
      console.log('✅ Removed scheduled_by_id column');

      // Step 3: Create the old ENUM type
      await queryInterface.sequelize.query(`
        CREATE TYPE appointment_status_enum_old AS ENUM (
          'draft',
          'quote',
          'booked',
          'completed',
          'cancelled'
        );
      `, { transaction });
      console.log('✅ Created old appointment_status_enum_old type');

      // Step 4: Add temporary column with old type
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments 
        ADD COLUMN status_old appointment_status_enum_old;
      `, { transaction });
      console.log('✅ Added temporary status_old column');

      // Step 5: Migrate data back to old status values
      await queryInterface.sequelize.query(`
        UPDATE appointments SET status_old = CASE
          WHEN status = 'started' THEN 'draft'::appointment_status_enum_old
          WHEN status = 'held' THEN 'draft'::appointment_status_enum_old
          WHEN status = 'rescheduling' THEN 'draft'::appointment_status_enum_old
          WHEN status = 'quoted' THEN 'quote'::appointment_status_enum_old
          WHEN status = 'submitted' THEN 'booked'::appointment_status_enum_old
          WHEN status = 'confirmed' THEN 'completed'::appointment_status_enum_old
          WHEN status = 'cancelled' THEN 'cancelled'::appointment_status_enum_old
          WHEN status = 'deleted' THEN 'cancelled'::appointment_status_enum_old
          ELSE 'draft'::appointment_status_enum_old
        END;
      `, { transaction });
      console.log('✅ Migrated status values back to old statuses');

      // Step 6: Drop the current status column
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments DROP COLUMN status;
      `, { transaction });
      console.log('✅ Dropped current status column');

      // Step 7: Rename old column to status
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments RENAME COLUMN status_old TO status;
      `, { transaction });
      console.log('✅ Renamed status_old to status');

      // Step 8: Set NOT NULL and default
      await queryInterface.sequelize.query(`
        ALTER TABLE appointments 
        ALTER COLUMN status SET NOT NULL,
        ALTER COLUMN status SET DEFAULT 'draft'::appointment_status_enum_old;
      `, { transaction });
      console.log('✅ Set NOT NULL and default for status column');

      // Step 9: Drop the new ENUM type
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS appointment_status_enum;
      `, { transaction });
      console.log('✅ Dropped new appointment_status_enum type');

      // Step 10: Rename old type to original name
      await queryInterface.sequelize.query(`
        ALTER TYPE appointment_status_enum_old RENAME TO appointment_status_enum;
      `, { transaction });
      console.log('✅ Renamed appointment_status_enum_old to appointment_status_enum');

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};

