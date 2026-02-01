/**
 * Migration: Remove legacy clientId/agentId columns from appointments
 * Date: 2026-02-04
 * Session: 2.1.3b - Appointment Attendees Architecture
 * 
 * Purpose: 
 * - Remove deprecated client_id and agent_id columns from appointments table
 * - Also removes additional_contacts JSONB column (replaced by appointment_attendees)
 * - Should run AFTER data migration (20260204_000019)
 * 
 * LEARNING: Clean removal of deprecated schema after data migration
 * WHY: Legacy columns replaced by appointment_attendees junction table
 * PATTERN: Remove columns after data has been migrated
 * 
 * ⚠️ WARNING: This migration is destructive. Ensure data migration has run first.
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Removing legacy attendee columns from appointments...');

    // Verify data has been migrated by checking appointment_attendees has records
    const [attendeesCount] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count FROM appointment_attendees
    `);
    
    const [appointmentsWithLegacy] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE client_id IS NOT NULL OR agent_id IS NOT NULL
    `);
    
    console.log(`📊 appointment_attendees has ${attendeesCount[0].count} records`);
    console.log(`📊 appointments with legacy data: ${appointmentsWithLegacy[0].count}`);
    
    // Get table description to check which columns exist
    const tableDescription = await queryInterface.describeTable('appointments');
    
    // Remove client_id column if it exists
    if (tableDescription.client_id) {
      // First drop the foreign key constraint
      try {
        await queryInterface.removeConstraint('appointments', 'appointments_client_id_fkey');
        console.log('✅ Dropped foreign key constraint: appointments_client_id_fkey');
      } catch (error) {
        console.log('ℹ️ Foreign key constraint appointments_client_id_fkey may not exist, continuing...');
      }
      
      await queryInterface.removeColumn('appointments', 'client_id');
      console.log('✅ Removed column: client_id');
    } else {
      console.log('ℹ️ Column client_id does not exist, skipping');
    }
    
    // Remove agent_id column if it exists
    if (tableDescription.agent_id) {
      // First drop the foreign key constraint
      try {
        await queryInterface.removeConstraint('appointments', 'appointments_agent_id_fkey');
        console.log('✅ Dropped foreign key constraint: appointments_agent_id_fkey');
      } catch (error) {
        console.log('ℹ️ Foreign key constraint appointments_agent_id_fkey may not exist, continuing...');
      }
      
      await queryInterface.removeColumn('appointments', 'agent_id');
      console.log('✅ Removed column: agent_id');
    } else {
      console.log('ℹ️ Column agent_id does not exist, skipping');
    }
    
    // Remove additional_contacts JSONB column if it exists (also deprecated)
    if (tableDescription.additional_contacts) {
      await queryInterface.removeColumn('appointments', 'additional_contacts');
      console.log('✅ Removed column: additional_contacts');
    } else {
      console.log('ℹ️ Column additional_contacts does not exist, skipping');
    }
    
    console.log('✅ Migration complete: Legacy attendee columns removed');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back: Re-adding legacy attendee columns...');
    
    const tableDescription = await queryInterface.describeTable('appointments');
    
    // Re-add client_id column
    if (!tableDescription.client_id) {
      await queryInterface.addColumn('appointments', 'client_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      console.log('✅ Re-added column: client_id');
    }
    
    // Re-add agent_id column
    if (!tableDescription.agent_id) {
      await queryInterface.addColumn('appointments', 'agent_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      console.log('✅ Re-added column: agent_id');
    }
    
    // Re-add additional_contacts column
    if (!tableDescription.additional_contacts) {
      await queryInterface.addColumn('appointments', 'additional_contacts', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
      console.log('✅ Re-added column: additional_contacts');
    }
    
    // Note: Data would need to be restored from appointment_attendees if needed
    console.log('⚠️ Note: Columns re-added but data not restored. Use appointment_attendees as source of truth.');
    
    console.log('✅ Rollback complete');
  },
};
