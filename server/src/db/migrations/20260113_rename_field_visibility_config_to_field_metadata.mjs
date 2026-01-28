/**
 * Migration: Rename field_visibility_config to field_metadata
 * Date: 2026-01-13
 * Purpose: Rename field_visibility_config column to field_metadata on both block_shapes and part_shapes tables.
 *          Migrate existing data: if field_visibility_config contains { fieldMetadata: {...} }, extract just the fieldMetadata object.
 * 
 * LEARNING: Simplifying structure by removing wrapper object
 * WHY: Current structure fieldVisibilityConfig: { fieldMetadata: {...} } is confusing and unnecessary
 *      The wrapper fieldVisibilityConfig adds no value - we can use fieldMetadata directly
 * PATTERN: Direct fieldMetadata structure without wrapper
 * 
 * Structure change:
 * OLD: field_visibility_config: { fieldMetadata: { 'fieldName': {...} } }
 * NEW: field_metadata: { 'fieldName': {...} }
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting field_visibility_config to field_metadata migration...');

    // Migrate block_shapes table
    const blockShapesTableExists = await queryInterface.tableExists('block_shapes');
    
    if (blockShapesTableExists) {
      // Check if field_visibility_config column exists
      const [blockColumnExists] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'block_shapes' AND column_name = 'field_visibility_config'
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (blockColumnExists?.exists) {
        // Check if field_metadata column already exists
        const [blockMetadataExists] = await queryInterface.sequelize.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'block_shapes' AND column_name = 'field_metadata'
          ) as exists;
        `, { type: Sequelize.QueryTypes.SELECT });

        if (!blockMetadataExists?.exists) {
          // Add field_metadata column
          await queryInterface.addColumn('block_shapes', 'field_metadata', {
            type: Sequelize.JSONB,
            allowNull: true,
            comment: 'Field metadata configuration for blockInstance fields',
          });

          // Migrate data: extract fieldMetadata from wrapper if it exists
          await queryInterface.sequelize.query(`
            UPDATE block_shapes
            SET field_metadata = CASE
              WHEN field_visibility_config IS NULL THEN NULL
              WHEN field_visibility_config->>'fieldMetadata' IS NOT NULL 
                THEN (field_visibility_config->>'fieldMetadata')::jsonb
              ELSE field_visibility_config
            END;
          `);

          console.log('✅ Migrated block_shapes field_visibility_config to field_metadata');

          // Remove old column
          await queryInterface.removeColumn('block_shapes', 'field_visibility_config');
          console.log('✅ Removed field_visibility_config column from block_shapes');
        } else {
          console.log('ℹ️  field_metadata column already exists on block_shapes, skipping');
        }
      } else {
        console.log('ℹ️  field_visibility_config column does not exist on block_shapes, skipping');
      }
    } else {
      console.log('ℹ️  block_shapes table does not exist, skipping');
    }

    // Migrate part_shapes table
    const partShapesTableExists = await queryInterface.tableExists('part_shapes');
    
    if (partShapesTableExists) {
      // Check if field_visibility_config column exists
      const [partColumnExists] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'part_shapes' AND column_name = 'field_visibility_config'
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (partColumnExists?.exists) {
        // Check if field_metadata column already exists
        const [partMetadataExists] = await queryInterface.sequelize.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'part_shapes' AND column_name = 'field_metadata'
          ) as exists;
        `, { type: Sequelize.QueryTypes.SELECT });

        if (!partMetadataExists?.exists) {
          // Add field_metadata column
          await queryInterface.addColumn('part_shapes', 'field_metadata', {
            type: Sequelize.JSONB,
            allowNull: true,
            comment: 'Field metadata configuration for partInstance fields',
          });

          // Migrate data: extract fieldMetadata from wrapper if it exists
          await queryInterface.sequelize.query(`
            UPDATE part_shapes
            SET field_metadata = CASE
              WHEN field_visibility_config IS NULL THEN NULL
              WHEN field_visibility_config->>'fieldMetadata' IS NOT NULL 
                THEN (field_visibility_config->>'fieldMetadata')::jsonb
              ELSE field_visibility_config
            END;
          `);

          console.log('✅ Migrated part_shapes field_visibility_config to field_metadata');

          // Remove old column
          await queryInterface.removeColumn('part_shapes', 'field_visibility_config');
          console.log('✅ Removed field_visibility_config column from part_shapes');
        } else {
          console.log('ℹ️  field_metadata column already exists on part_shapes, skipping');
        }
      } else {
        console.log('ℹ️  field_visibility_config column does not exist on part_shapes, skipping');
      }
    } else {
      console.log('ℹ️  part_shapes table does not exist, skipping');
    }

    console.log('✅ Completed field_visibility_config to field_metadata migration');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting field_metadata to field_visibility_config migration...');

    // Revert block_shapes table
    const blockShapesTableExists = await queryInterface.tableExists('block_shapes');
    
    if (blockShapesTableExists) {
      const [blockMetadataExists] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'block_shapes' AND column_name = 'field_metadata'
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (blockMetadataExists?.exists) {
        // Check if field_visibility_config column already exists
        const [blockConfigExists] = await queryInterface.sequelize.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'block_shapes' AND column_name = 'field_visibility_config'
          ) as exists;
        `, { type: Sequelize.QueryTypes.SELECT });

        if (!blockConfigExists?.exists) {
          // Add field_visibility_config column
          await queryInterface.addColumn('block_shapes', 'field_visibility_config', {
            type: Sequelize.JSONB,
            allowNull: true,
            comment: 'Field visibility configuration for blockInstance fields',
          });

          // Revert data: wrap fieldMetadata back in wrapper
          await queryInterface.sequelize.query(`
            UPDATE block_shapes
            SET field_visibility_config = CASE
              WHEN field_metadata IS NULL THEN NULL
              ELSE jsonb_build_object('fieldMetadata', field_metadata)
            END;
          `);

          // Remove field_metadata column
          await queryInterface.removeColumn('block_shapes', 'field_metadata');
          console.log('✅ Reverted block_shapes field_metadata to field_visibility_config');
        } else {
          console.log('ℹ️  field_visibility_config column already exists on block_shapes, skipping');
        }
      } else {
        console.log('ℹ️  field_metadata column does not exist on block_shapes, skipping');
      }
    }

    // Revert part_shapes table
    const partShapesTableExists = await queryInterface.tableExists('part_shapes');
    
    if (partShapesTableExists) {
      const [partMetadataExists] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'part_shapes' AND column_name = 'field_metadata'
        ) as exists;
      `, { type: Sequelize.QueryTypes.SELECT });

      if (partMetadataExists?.exists) {
        // Check if field_visibility_config column already exists
        const [partConfigExists] = await queryInterface.sequelize.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'part_shapes' AND column_name = 'field_visibility_config'
          ) as exists;
        `, { type: Sequelize.QueryTypes.SELECT });

        if (!partConfigExists?.exists) {
          // Add field_visibility_config column
          await queryInterface.addColumn('part_shapes', 'field_visibility_config', {
            type: Sequelize.JSONB,
            allowNull: true,
            comment: 'Field visibility configuration for partInstance fields',
          });

          // Revert data: wrap fieldMetadata back in wrapper
          await queryInterface.sequelize.query(`
            UPDATE part_shapes
            SET field_visibility_config = CASE
              WHEN field_metadata IS NULL THEN NULL
              ELSE jsonb_build_object('fieldMetadata', field_metadata)
            END;
          `);

          // Remove field_metadata column
          await queryInterface.removeColumn('part_shapes', 'field_metadata');
          console.log('✅ Reverted part_shapes field_metadata to field_visibility_config');
        } else {
          console.log('ℹ️  field_visibility_config column already exists on part_shapes, skipping');
        }
      } else {
        console.log('ℹ️  field_metadata column does not exist on part_shapes, skipping');
      }
    }

    console.log('✅ Completed reversion of field_metadata to field_visibility_config');
  }
};
