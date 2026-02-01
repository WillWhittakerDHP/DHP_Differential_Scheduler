/**
 * Migration: Migrate existing appointments clientId/agentId to appointment_attendees
 * Date: 2026-02-04
 * Session: 2.1.3b - Appointment Attendees Architecture
 * 
 * Purpose: 
 * - Transfer existing clientId and agentId from appointments to appointment_attendees table
 * - Preserves data before removing legacy columns
 * - Maps roles to UserTypeBlock IDs where possible
 * 
 * LEARNING: Data migration pattern for schema evolution
 * WHY: Moving from hardcoded clientId/agentId to flexible attendees model
 * PATTERN: Copy data first, then remove columns in separate migration
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Migrating existing appointments to appointment_attendees...');

    // Check if appointment_attendees table exists
    const attendeesTableExists = await queryInterface.tableExists('appointment_attendees');
    if (!attendeesTableExists) {
      console.log('❌ appointment_attendees table does not exist, skipping migration');
      return;
    }

    // Find state control block shapes (UserTypeBlocks)
    const [stateControlShapes] = await queryInterface.sequelize.query(`
      SELECT id, name FROM block_shapes WHERE is_state_control = true
    `);
    
    if (stateControlShapes.length === 0) {
      console.log('⚠️ No state control block shapes found, will skip UserTypeBlock assignment');
    }
    
    const stateControlShapeIds = stateControlShapes.map(s => s.id);
    
    // Find UserTypeBlock instances
    let userTypeBlocks = [];
    if (stateControlShapeIds.length > 0) {
      const placeholders = stateControlShapeIds.map(() => '?').join(',');
      const [blocks] = await queryInterface.sequelize.query(`
        SELECT id, name, block_shape_ref FROM block_instances 
        WHERE block_shape_ref IN (${placeholders})
      `, {
        replacements: stateControlShapeIds
      });
      userTypeBlocks = blocks;
    }
    
    // Create mapping of role names to UserTypeBlock IDs
    const roleToBlockId = {};
    for (const block of userTypeBlocks) {
      const name = block.name.toLowerCase();
      if (name === 'buyer' || name === 'client') {
        roleToBlockId['client'] = block.id;
      } else if (name === 'agent') {
        roleToBlockId['agent'] = block.id;
      }
    }
    
    console.log('📋 Role to UserTypeBlock mapping:', roleToBlockId);

    // Get all appointments with clientId or agentId
    const [appointments] = await queryInterface.sequelize.query(`
      SELECT id, client_id, agent_id 
      FROM appointments 
      WHERE client_id IS NOT NULL OR agent_id IS NOT NULL
    `);
    
    console.log(`📊 Found ${appointments.length} appointments to migrate`);
    
    if (appointments.length === 0) {
      console.log('ℹ️ No appointments to migrate');
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const appointment of appointments) {
      // Migrate client
      if (appointment.client_id) {
        // Check if already migrated
        const [existing] = await queryInterface.sequelize.query(`
          SELECT id FROM appointment_attendees 
          WHERE appointment_id = ? AND user_id = ?
        `, {
          replacements: [appointment.id, appointment.client_id]
        });
        
        if (existing.length === 0) {
          const clientBlockId = roleToBlockId['client'] || null;
          await queryInterface.sequelize.query(`
            INSERT INTO appointment_attendees 
            (id, appointment_id, user_id, user_type_block_instance_id, should_receive_invitation, invitation_status, created_at, updated_at)
            VALUES (gen_random_uuid(), ?, ?, ?, true, 'pending', NOW(), NOW())
          `, {
            replacements: [appointment.id, appointment.client_id, clientBlockId]
          });
          migratedCount++;
        } else {
          skippedCount++;
        }
      }
      
      // Migrate agent
      if (appointment.agent_id) {
        // Check if already migrated
        const [existing] = await queryInterface.sequelize.query(`
          SELECT id FROM appointment_attendees 
          WHERE appointment_id = ? AND user_id = ?
        `, {
          replacements: [appointment.id, appointment.agent_id]
        });
        
        if (existing.length === 0) {
          const agentBlockId = roleToBlockId['agent'] || null;
          await queryInterface.sequelize.query(`
            INSERT INTO appointment_attendees 
            (id, appointment_id, user_id, user_type_block_instance_id, should_receive_invitation, invitation_status, created_at, updated_at)
            VALUES (gen_random_uuid(), ?, ?, ?, true, 'pending', NOW(), NOW())
          `, {
            replacements: [appointment.id, appointment.agent_id, agentBlockId]
          });
          migratedCount++;
        } else {
          skippedCount++;
        }
      }
    }
    
    console.log(`✅ Migration complete: ${migratedCount} attendees created, ${skippedCount} already existed`);
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back: Removing migrated attendees...');
    
    // Note: This is a lossy rollback - we can't perfectly restore the original state
    // because appointment_attendees may have been modified after migration
    // We'll just remove all appointment_attendees that match the pattern
    
    console.log('⚠️ Note: Rolling back data migration. appointment_attendees entries created by this migration will remain.');
    console.log('ℹ️ To fully rollback, manually delete appointment_attendees entries if needed.');
    
    // We don't delete data on rollback to be safe
    // The forward migration is idempotent (checks for existing records)
  },
};
