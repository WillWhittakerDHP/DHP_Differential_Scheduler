/**
 * Migration: Add block_shape_ref column to admin_metadata table
 * Date: 2026-01-19
 * Purpose: Add blockShapeRef discriminator to support BlockShape-specific instance metadata
 *          Allows each BlockShape's instances to have their own metadata configuration
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding block_shape_ref column to admin_metadata table...');

    const tableExists = await queryInterface.tableExists('admin_metadata');
    
    if (!tableExists) {
      console.log('❌ admin_metadata table does not exist, cannot add column');
      throw new Error('admin_metadata table does not exist');
    }

    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('admin_metadata');
    if (tableDescription.block_shape_ref) {
      console.log('ℹ️  block_shape_ref column already exists, skipping');
      return;
    }

    // Add block_shape_ref column (nullable UUID)
    await queryInterface.addColumn('admin_metadata', 'block_shape_ref', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'BlockShape ID for BlockShape-specific instance metadata (NULL = global config)',
      references: {
        model: 'block_shapes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Drop the old unique constraint
    await queryInterface.removeIndex('admin_metadata', 'admin_metadata_entity_metadata_field_unique');

    // Create new unique constraint that includes block_shape_ref
    // Using NULLS NOT DISTINCT to allow multiple NULL values (one per entity_type/entity_id/metadata_type/field_key combination)
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX admin_metadata_entity_metadata_field_unique 
      ON admin_metadata (entity_type, entity_id, metadata_type, field_key, block_shape_ref)
      NULLS NOT DISTINCT;
    `);

    // Add index for efficient lookups by blockShapeRef
    await queryInterface.addIndex('admin_metadata', ['entity_type', 'block_shape_ref', 'field_key'], {
      name: 'admin_metadata_blockshape_ref_idx',
      where: {
        block_shape_ref: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    console.log('✅ Added block_shape_ref column and updated indexes');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting block_shape_ref column addition...');

    const tableExists = await queryInterface.tableExists('admin_metadata');
    
    if (!tableExists) {
      console.log('ℹ️  admin_metadata table does not exist, skipping rollback');
      return;
    }

    // Remove the new index
    try {
      await queryInterface.removeIndex('admin_metadata', 'admin_metadata_blockshape_ref_idx');
    } catch (error) {
      console.log('ℹ️  Index admin_metadata_blockshape_ref_idx does not exist, skipping');
    }

    // Drop the new unique constraint
    try {
      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS admin_metadata_entity_metadata_field_unique;
      `);
    } catch (error) {
      console.log('ℹ️  Index admin_metadata_entity_metadata_field_unique does not exist, skipping');
    }

    // Restore the old unique constraint
    await queryInterface.addIndex('admin_metadata', ['entity_type', 'entity_id', 'metadata_type', 'field_key'], {
      unique: true,
      name: 'admin_metadata_entity_metadata_field_unique',
    });

    // Remove the column
    const tableDescription = await queryInterface.describeTable('admin_metadata');
    if (tableDescription.block_shape_ref) {
      await queryInterface.removeColumn('admin_metadata', 'block_shape_ref');
    }

    console.log('✅ Reverted block_shape_ref column addition');
  },
};
