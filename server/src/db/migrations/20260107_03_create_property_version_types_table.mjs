/**
 * Migration: Create property_version_types junction table
 * Date: 2026-01-07
 * Purpose: Enable properties to have associated property types (Single-Family, Condo, etc.) 
 *          from block_instances, following the same pattern as instance_components.
 * 
 * LEARNING: Junction table pattern for property types
 * WHY: Properties can have multiple types (e.g., Single-Family with ADU), similar to how 
 *      services can have multiple components via instance_components
 * PATTERN: Many-to-many relationship with validation via database trigger
 * 
 * Constraint: block_instance_id must reference a block_instance with "Properties" block_shape
 * Implementation: Both database trigger AND application-level validation for maximum stability
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Creating property_version_types table...');

    // Step 1: Create the property_version_types table
    await queryInterface.createTable('property_version_types', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      block_instance_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order in which property types should be displayed',
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
    console.log('✅ Created property_version_types table');

    // Step 2: Add unique constraint (property_version_id, block_instance_id)
    await queryInterface.addConstraint('property_version_types', {
      fields: ['property_version_id', 'block_instance_id'],
      type: 'unique',
      name: 'property_version_types_property_version_id_block_instance_id_key',
    });
    console.log('✅ Added unique constraint on (property_version_id, block_instance_id)');

    // Step 3: Add indexes for lookup performance
    await queryInterface.addIndex('property_version_types', ['property_version_id'], {
      name: 'property_version_types_property_version_id_idx',
    });
    await queryInterface.addIndex('property_version_types', ['block_instance_id'], {
      name: 'property_version_types_block_instance_id_idx',
    });
    console.log('✅ Added indexes for property_version_id and block_instance_id');

    // Step 4: Create validation trigger function
    // This ensures block_instance_id references a block_instance with "Properties" block_shape
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION validate_property_version_type()
      RETURNS TRIGGER AS $$
      DECLARE
        block_shape_name TEXT;
      BEGIN
        SELECT bs.name INTO block_shape_name
        FROM block_instances bi
        JOIN block_shapes bs ON bi.block_shape_ref = bs.id
        WHERE bi.id = NEW.block_instance_id;
        
        IF block_shape_name IS NULL OR block_shape_name != 'Properties' THEN
          RAISE EXCEPTION 'block_instance_id must reference a block_instance with block_shape "Properties". Got: %', COALESCE(block_shape_name, 'NULL');
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Created validate_property_version_type function');

    // Step 5: Create trigger to validate on insert/update
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_validate_property_version_type
        BEFORE INSERT OR UPDATE ON property_version_types
        FOR EACH ROW
        EXECUTE FUNCTION validate_property_version_type();
    `);
    console.log('✅ Created validation trigger');

    console.log('✅ property_version_types table creation completed!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Dropping property_version_types table...');

    // Step 1: Drop trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_validate_property_version_type ON property_version_types;
    `);
    console.log('✅ Dropped validation trigger');

    // Step 2: Drop function
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS validate_property_version_type();
    `);
    console.log('✅ Dropped validate_property_version_type function');

    // Step 3: Drop table (indexes and constraints will be dropped automatically)
    await queryInterface.dropTable('property_version_types');
    console.log('✅ Dropped property_version_types table');

    console.log('✅ property_version_types table drop completed!');
  }
};

