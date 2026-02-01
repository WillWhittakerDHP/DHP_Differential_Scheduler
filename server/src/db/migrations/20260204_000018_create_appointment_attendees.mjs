/**
 * Migration: Create appointment_attendees relationship table
 * Date: 2026-02-04
 * Session: 2.1.3b - Appointment Attendees Architecture
 * 
 * Purpose: 
 * - Create junction table linking appointments to actual Users with their roles
 * - Replaces hardcoded clientId/agentId on appointments with flexible attendee model
 * - Tracks invitation status for Google Calendar integration
 * - Links to UserTypeBlock (BlockInstance) for dynamic role assignment
 * 
 * LEARNING: Junction table pattern for flexible appointment attendees
 * WHY: Enables N attendees per appointment, proper calendar invitations, role tracking
 * PATTERN: Similar to event_shape_attendees but for actual appointment instances
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Creating appointment_attendees relationship table...');

    const tableExists = await queryInterface.tableExists('appointment_attendees');
    
    if (tableExists) {
      console.log('ℹ️  Table appointment_attendees already exists, skipping migration');
      return;
    }

    // Create appointment_attendees table
    console.log('📝 Creating appointment_attendees table...');
    await queryInterface.createTable('appointment_attendees', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      appointment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Foreign key to appointments table',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Foreign key to users table (actual person with email)',
      },
      user_type_block_instance_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Foreign key to block_instances table (UserTypeBlock - their role: Buyer, Agent, etc.)',
      },
      should_receive_invitation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this attendee should receive calendar invitation',
      },
      invitation_status: {
        type: Sequelize.ENUM('pending', 'sent', 'accepted', 'declined', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status of calendar invitation for this attendee',
      },
      google_event_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Google Calendar event ID for tracking invitation status',
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

    console.log('✅ Created appointment_attendees table');

    // Add foreign key constraints
    console.log('📝 Adding foreign key constraints...');
    
    await queryInterface.addConstraint('appointment_attendees', {
      fields: ['appointment_id'],
      type: 'foreign key',
      name: 'appointment_attendees_appointment_id_fkey',
      references: {
        table: 'appointments',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('appointment_attendees', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'appointment_attendees_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('appointment_attendees', {
      fields: ['user_type_block_instance_id'],
      type: 'foreign key',
      name: 'appointment_attendees_user_type_block_instance_id_fkey',
      references: {
        table: 'block_instances',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    console.log('✅ Added foreign key constraints');

    // Add unique constraint on (appointment_id, user_id) - same user can't be added twice to same appointment
    console.log('📝 Adding unique constraint...');
    await queryInterface.addConstraint('appointment_attendees', {
      fields: ['appointment_id', 'user_id'],
      type: 'unique',
      name: 'unique_appointment_attendee',
    });

    console.log('✅ Added unique constraint');

    // Add indexes for efficient queries
    console.log('📝 Adding indexes...');
    await queryInterface.addIndex('appointment_attendees', {
      fields: ['appointment_id'],
      name: 'idx_appointment_attendees_appointment_id',
    });

    await queryInterface.addIndex('appointment_attendees', {
      fields: ['user_id'],
      name: 'idx_appointment_attendees_user_id',
    });

    await queryInterface.addIndex('appointment_attendees', {
      fields: ['user_type_block_instance_id'],
      name: 'idx_appointment_attendees_user_type_block_instance_id',
    });

    await queryInterface.addIndex('appointment_attendees', {
      fields: ['invitation_status'],
      name: 'idx_appointment_attendees_invitation_status',
    });

    console.log('✅ Added indexes');

    // Add deprecation comment to appointments.client_id and agent_id
    console.log('📝 Adding deprecation comments to appointments.client_id and agent_id...');
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN appointments.client_id IS 'DEPRECATED: Use appointment_attendees table instead. Will be removed in future migration.';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN appointments.agent_id IS 'DEPRECATED: Use appointment_attendees table instead. Will be removed in future migration.';
    `);

    console.log('✅ Added deprecation comments');
    console.log('✅ Migration completed successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Dropping appointment_attendees table...');

    const tableExists = await queryInterface.tableExists('appointment_attendees');
    
    if (!tableExists) {
      console.log('ℹ️  Table appointment_attendees does not exist, skipping rollback');
      return;
    }

    // Drop indexes
    try {
      await queryInterface.removeIndex('appointment_attendees', 'idx_appointment_attendees_appointment_id');
      await queryInterface.removeIndex('appointment_attendees', 'idx_appointment_attendees_user_id');
      await queryInterface.removeIndex('appointment_attendees', 'idx_appointment_attendees_user_type_block_instance_id');
      await queryInterface.removeIndex('appointment_attendees', 'idx_appointment_attendees_invitation_status');
      console.log('✅ Dropped indexes');
    } catch (error) {
      console.log('ℹ️  Indexes may not exist, continuing...');
    }

    // Drop constraints
    try {
      await queryInterface.removeConstraint('appointment_attendees', 'unique_appointment_attendee');
      await queryInterface.removeConstraint('appointment_attendees', 'appointment_attendees_appointment_id_fkey');
      await queryInterface.removeConstraint('appointment_attendees', 'appointment_attendees_user_id_fkey');
      await queryInterface.removeConstraint('appointment_attendees', 'appointment_attendees_user_type_block_instance_id_fkey');
      console.log('✅ Dropped constraints');
    } catch (error) {
      console.log('ℹ️  Constraints may not exist, continuing...');
    }

    // Drop ENUM type
    try {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_appointment_attendees_invitation_status";`);
      console.log('✅ Dropped ENUM type');
    } catch (error) {
      console.log('ℹ️  ENUM type may not exist, continuing...');
    }

    // Drop table
    await queryInterface.dropTable('appointment_attendees');
    console.log('✅ Dropped appointment_attendees table');

    // Remove deprecation comments (restore original state)
    try {
      await queryInterface.sequelize.query(`
        COMMENT ON COLUMN appointments.client_id IS NULL;
      `);
      await queryInterface.sequelize.query(`
        COMMENT ON COLUMN appointments.agent_id IS NULL;
      `);
      console.log('✅ Removed deprecation comments');
    } catch (error) {
      console.log('ℹ️  Could not remove comments, continuing...');
    }
  },
};
