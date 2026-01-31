/**
 * Migration: Create event tables following annotation pattern
 * Date: 2026-01-30
 * Purpose: 
 * - Create event_shapes table (shape-level: defines what event types can exist)
 * - Create event_instances table (instance-level: concrete event configurations with templates)
 * - Create active_events table (runtime: which events are assigned to which shapes)
 * 
 * LEARNING: This creates full parallelism with annotation/entity/relationship naming:
 * - Shapes: block_shapes, part_shapes, annotation_shapes, event_shapes
 * - Instances: block_instances, part_instances, annotation_instances, event_instances
 * - Active Relationships: active_cascades, active_components, active_parts, active_annotations, active_events
 * 
 * WHY: 
 * - Consistent naming pattern across entire system
 * - Clear distinction between shape-level (definitions) and instance-level (concrete entities)
 * - Events are configured at shape level (PartShape/BlockShape), not instance level
 * - Enables admin-configurable event types and templates for calendar integration
 * 
 * PATTERN: Multi-step migration following annotation pattern
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting event tables creation migration...');

    // Step 1: Create event_shapes table
    const eventShapesExists = await queryInterface.tableExists('event_shapes');
    
    if (!eventShapesExists) {
      console.log('📝 Creating event_shapes table...');
      
      await queryInterface.createTable('event_shapes', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          comment: 'Event shape name (e.g., OnSite, Moveable, ClientPresent)',
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

      // Add unique index on name
      await queryInterface.addIndex('event_shapes', ['name'], {
        unique: true,
        name: 'idx_event_shapes_name_unique',
      });

      console.log('   ✅ event_shapes table created');
    } else {
      console.log('ℹ️  Table event_shapes already exists, skipping creation');
    }

    // Step 2: Create event_instances table
    const eventInstancesExists = await queryInterface.tableExists('event_instances');
    
    if (!eventInstancesExists) {
      console.log('📝 Creating event_instances table...');
      
      await queryInterface.createTable('event_instances', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        event_shape_ref: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'event_shape_ref',
          comment: 'Foreign key to event_shapes table',
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: 'Event instance name/template name',
        },
        title_template: {
          type: Sequelize.TEXT,
          allowNull: true,
          field: 'title_template',
          comment: 'Template for event title (e.g., "{service} on {propertyType}")',
        },
        description_template: {
          type: Sequelize.TEXT,
          allowNull: true,
          field: 'description_template',
          comment: 'Template for event description (e.g., "{clientName} - {propertyAddress}")',
        },
        location_template: {
          type: Sequelize.TEXT,
          allowNull: true,
          field: 'location_template',
          comment: 'Template for event location (e.g., "{propertyAddress}")',
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

      // Add foreign key constraint explicitly (since we removed references from column definition)
      // Check if constraint already exists (in case table was partially created)
      try {
        await queryInterface.addConstraint('event_instances', {
          fields: ['event_shape_ref'],
          type: 'foreign key',
          name: 'event_instances_event_shape_ref_fkey',
          references: {
            table: 'event_shapes',
            field: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        });
      } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42710') {
          // Constraint already exists, that's okay
          console.log('   ℹ️  Foreign key constraint already exists, skipping');
        } else {
          throw error;
        }
      }

      // Add indexes
      await queryInterface.addIndex('event_instances', ['event_shape_ref'], {
        name: 'idx_event_instances_event_shape_ref',
      });

      console.log('   ✅ event_instances table created');
    } else {
      console.log('ℹ️  Table event_instances already exists, skipping creation');
    }

    // Step 3: Create active_events table
    const activeEventsExists = await queryInterface.tableExists('active_events');
    
    if (!activeEventsExists) {
      console.log('📝 Creating active_events table...');
      
      await queryInterface.createTable('active_events', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        part_shape_id: {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'part_shape_id',
          comment: 'Foreign key to part_shapes table (shape-level event configuration)',
        },
        block_shape_id: {
          type: Sequelize.UUID,
          allowNull: true,
          field: 'block_shape_id',
          comment: 'Foreign key to block_shapes table (shape-level event configuration for blocks)',
        },
        event_instance_id: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'event_instance_id',
          comment: 'Foreign key to event_instances table',
        },
        order_index: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'order_index',
          comment: 'Order in which events should be processed',
        },
        ternary_value: {
          type: Sequelize.ENUM('true', 'false', 'override'),
          allowNull: true,
          field: 'ternary_value',
          comment: 'Ternary value for onSite/clientPresent (null defaults to true)',
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

      // Add foreign key constraints explicitly (since we removed references from column definitions)
      // Check if constraints already exist (in case table was partially created)
      const addConstraintIfNotExists = async (tableName, constraintConfig) => {
        try {
          await queryInterface.addConstraint(tableName, constraintConfig);
        } catch (error) {
          if (error.name === 'SequelizeDatabaseError' && error.parent?.code === '42710') {
            // Constraint already exists, that's okay
            console.log(`   ℹ️  Foreign key constraint ${constraintConfig.name} already exists, skipping`);
          } else {
            throw error;
          }
        }
      };

      await addConstraintIfNotExists('active_events', {
        fields: ['part_shape_id'],
        type: 'foreign key',
        name: 'active_events_part_shape_id_fkey',
        references: {
          table: 'part_shapes',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      await addConstraintIfNotExists('active_events', {
        fields: ['block_shape_id'],
        type: 'foreign key',
        name: 'active_events_block_shape_id_fkey',
        references: {
          table: 'block_shapes',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });

      await addConstraintIfNotExists('active_events', {
        fields: ['event_instance_id'],
        type: 'foreign key',
        name: 'active_events_event_instance_id_fkey',
        references: {
          table: 'event_instances',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      // Add check constraint: either part_shape_id OR block_shape_id must be set (not both, not neither)
      await queryInterface.sequelize.query(`
        ALTER TABLE active_events
        ADD CONSTRAINT active_events_shape_check
        CHECK (
          (part_shape_id IS NOT NULL AND block_shape_id IS NULL) OR
          (part_shape_id IS NULL AND block_shape_id IS NOT NULL)
        )
      `);

      // Add indexes
      await queryInterface.addIndex('active_events', ['part_shape_id'], {
        name: 'idx_active_events_part_shape_id',
      });

      await queryInterface.addIndex('active_events', ['block_shape_id'], {
        name: 'idx_active_events_block_shape_id',
      });

      await queryInterface.addIndex('active_events', ['event_instance_id'], {
        name: 'idx_active_events_event_instance_id',
      });

      await queryInterface.addIndex('active_events', ['order_index'], {
        name: 'idx_active_events_order_index',
      });

      console.log('   ✅ active_events table created');
    } else {
      console.log('ℹ️  Table active_events already exists, skipping creation');
    }

    console.log('✅ Event tables creation migration completed');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting event tables creation migration...');

    // Drop tables in reverse order (due to foreign key constraints)
    const activeEventsExists = await queryInterface.tableExists('active_events');
    if (activeEventsExists) {
      console.log('📝 Dropping active_events table...');
      await queryInterface.dropTable('active_events');
      console.log('   ✅ active_events table dropped');
    }

    const eventInstancesExists = await queryInterface.tableExists('event_instances');
    if (eventInstancesExists) {
      console.log('📝 Dropping event_instances table...');
      await queryInterface.dropTable('event_instances');
      console.log('   ✅ event_instances table dropped');
    }

    const eventShapesExists = await queryInterface.tableExists('event_shapes');
    if (eventShapesExists) {
      console.log('📝 Dropping event_shapes table...');
      await queryInterface.dropTable('event_shapes');
      console.log('   ✅ event_shapes table dropped');
    }

    // Drop enum type if it exists
    try {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_active_events_ternary_value"`);
      console.log('   ✅ ternary_value enum type dropped');
    } catch (e) {
      console.log('   ℹ️  Enum type already dropped or doesn\'t exist');
    }

    console.log('✅ Event tables creation migration reverted');
  },
};
