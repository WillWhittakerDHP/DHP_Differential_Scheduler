/**
 * Migration: Create event_shape_attendees relationship table
 * Date: 2026-02-04
 * Purpose: 
 * - Create junction table for many-to-many relationship between event_shapes and UserTypeBlock instances (block_instances)
 * - Enables event shapes to reference which user types (inspector, client, agent) attend the event
 * - Matches annotation_assignment pattern using user_type_block_instance_id
 * 
 * LEARNING: Many-to-many relationship pattern for event attendees
 * WHY: User types are BlockInstances (state control blocks), not hardcoded strings
 * PATTERN: Follows annotation_assignment pattern with userTypeBlockInstanceId FK
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Creating event_shape_attendees relationship table...');

    const tableExists = await queryInterface.tableExists('event_shape_attendees');
    
    if (tableExists) {
      console.log('ℹ️  Table event_shape_attendees already exists, skipping migration');
      return;
    }

    // Create event_shape_attendees table
    console.log('📝 Creating event_shape_attendees table...');
    await queryInterface.createTable('event_shape_attendees', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      event_shape_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Foreign key to event_shapes table',
      },
      user_type_block_instance_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Foreign key to block_instances table (UserTypeBlock representing attendee type)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    });

    console.log('✅ Created event_shape_attendees table');

    // Add foreign key constraints
    console.log('📝 Adding foreign key constraints...');
    await queryInterface.addConstraint('event_shape_attendees', {
      fields: ['event_shape_id'],
      type: 'foreign key',
      name: 'event_shape_attendees_event_shape_id_fkey',
      references: {
        table: 'event_shapes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('event_shape_attendees', {
      fields: ['user_type_block_instance_id'],
      type: 'foreign key',
      name: 'event_shape_attendees_user_type_block_instance_id_fkey',
      references: {
        table: 'block_instances',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    console.log('✅ Added foreign key constraints');

    // Add unique constraint on (event_shape_id, user_type_block_instance_id)
    console.log('📝 Adding unique constraint...');
    await queryInterface.addConstraint('event_shape_attendees', {
      fields: ['event_shape_id', 'user_type_block_instance_id'],
      type: 'unique',
      name: 'unique_event_shape_attendee',
    });

    console.log('✅ Added unique constraint');

    // Add indexes for efficient queries
    console.log('📝 Adding indexes...');
    await queryInterface.addIndex('event_shape_attendees', {
      fields: ['event_shape_id'],
      name: 'idx_event_shape_attendees_event_shape_id',
    });

    await queryInterface.addIndex('event_shape_attendees', {
      fields: ['user_type_block_instance_id'],
      name: 'idx_event_shape_attendees_user_type_block_instance_id',
    });

    console.log('✅ Added indexes');
    console.log('✅ Migration completed successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Dropping event_shape_attendees table...');

    const tableExists = await queryInterface.tableExists('event_shape_attendees');
    
    if (!tableExists) {
      console.log('ℹ️  Table event_shape_attendees does not exist, skipping rollback');
      return;
    }

    // Drop indexes
    try {
      await queryInterface.removeIndex('event_shape_attendees', 'idx_event_shape_attendees_event_shape_id');
      await queryInterface.removeIndex('event_shape_attendees', 'idx_event_shape_attendees_user_type_block_instance_id');
      console.log('✅ Dropped indexes');
    } catch (error) {
      console.log('ℹ️  Indexes may not exist, continuing...');
    }

    // Drop constraints
    try {
      await queryInterface.removeConstraint('event_shape_attendees', 'unique_event_shape_attendee');
      await queryInterface.removeConstraint('event_shape_attendees', 'event_shape_attendees_event_shape_id_fkey');
      await queryInterface.removeConstraint('event_shape_attendees', 'event_shape_attendees_user_type_block_instance_id_fkey');
      console.log('✅ Dropped constraints');
    } catch (error) {
      console.log('ℹ️  Constraints may not exist, continuing...');
    }

    // Drop table
    await queryInterface.dropTable('event_shape_attendees');
    console.log('✅ Dropped event_shape_attendees table');
  },
};
