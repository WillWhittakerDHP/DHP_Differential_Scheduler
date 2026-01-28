/**
 * Migration: Migrate existing fieldMetadata from JSONB to new tables
 * Date: 2026-01-15
 * Purpose: Transfer fieldMetadata from block_shapes and part_shapes JSONB columns
 *          to shape_layout_config table while preserving all configuration
 * 
 * LEARNING: One-time data migration from legacy system to new canonical system
 * WHY: Existing configurations must be preserved during system upgrade
 * PATTERN: Read JSONB, parse, validate, insert into normalized tables
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting fieldMetadata migration to new tables...');

    const { v4: uuidv4 } = await import('uuid');

    // Track migration statistics
    const stats = {
      blockShapesProcessed: 0,
      partShapesProcessed: 0,
      layoutConfigsCreated: 0,
      errors: [],
      warnings: [],
    };

    // Migrate BlockShape fieldMetadata
    console.log('\n📋 Migrating BlockShape fieldMetadata...');
    
    const blockShapes = await queryInterface.sequelize.query(
      `SELECT id, name, field_metadata FROM block_shapes WHERE field_metadata IS NOT NULL`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    console.log(`   Found ${blockShapes.length} BlockShapes with fieldMetadata`);

    for (const blockShape of blockShapes) {
      stats.blockShapesProcessed++;
      const fieldMetadata = blockShape.field_metadata;

      if (!fieldMetadata || typeof fieldMetadata !== 'object') {
        stats.warnings.push(`BlockShape "${blockShape.name}" has invalid fieldMetadata`);
        continue;
      }

      console.log(`   Processing BlockShape "${blockShape.name}" (${Object.keys(fieldMetadata).length} fields)`);

      for (const [fieldKey, config] of Object.entries(fieldMetadata)) {
        try {
          // Validate required properties
          if (!config || typeof config !== 'object') {
            stats.warnings.push(`BlockShape "${blockShape.name}" field "${fieldKey}" has invalid config`);
            continue;
          }

          // Check if this layout config already exists
          const existing = await queryInterface.sequelize.query(
            `SELECT id FROM shape_layout_config 
             WHERE shape_id = :shapeId 
             AND shape_type = 'block' 
             AND field_key = :fieldKey`,
            {
              type: queryInterface.sequelize.QueryTypes.SELECT,
              replacements: { shapeId: blockShape.id, fieldKey },
            }
          );

          if (existing.length > 0) {
            console.log(`      ⏭️  Skipping ${fieldKey} (already exists)`);
            continue;
          }

          // Verify canonical field metadata exists
          const canonicalExists = await queryInterface.sequelize.query(
            `SELECT id FROM shape_field_metadata 
             WHERE entity_type = 'block' 
             AND field_key = :fieldKey`,
            {
              type: queryInterface.sequelize.QueryTypes.SELECT,
              replacements: { fieldKey },
            }
          );

          if (canonicalExists.length === 0) {
            stats.warnings.push(
              `BlockShape "${blockShape.name}" field "${fieldKey}" has no canonical metadata - skipping`
            );
            continue;
          }

          // Insert into shape_layout_config
          await queryInterface.bulkInsert('shape_layout_config', [{
            id: uuidv4(),
            shape_id: blockShape.id,
            shape_type: 'block',
            field_key: fieldKey,
            visibility: config.visibility || 'hidden',
            layout: config.layout || 'stacked',
            order: config.order !== undefined ? config.order : 0,
            section: null,
            render_as: config.renderAs || 'field',
            status_button_color: config.statusButtonColor || null,
            panel: config.panel || 'none',
            bulk_edit: config.bulkEdit !== undefined ? config.bulkEdit : false,
            created_at: new Date(),
            updated_at: new Date(),
          }]);

          stats.layoutConfigsCreated++;
          console.log(`      ✅ Migrated ${fieldKey}`);
        } catch (error) {
          stats.errors.push({
            shape: `BlockShape "${blockShape.name}"`,
            field: fieldKey,
            error: error.message,
          });
          console.error(`      ❌ Error migrating ${fieldKey}:`, error.message);
        }
      }
    }

    // Migrate PartShape fieldMetadata
    console.log('\n📋 Migrating PartShape fieldMetadata...');
    
    const partShapes = await queryInterface.sequelize.query(
      `SELECT id, name, field_metadata FROM part_shapes WHERE field_metadata IS NOT NULL`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    console.log(`   Found ${partShapes.length} PartShapes with fieldMetadata`);

    for (const partShape of partShapes) {
      stats.partShapesProcessed++;
      const fieldMetadata = partShape.field_metadata;

      if (!fieldMetadata || typeof fieldMetadata !== 'object') {
        stats.warnings.push(`PartShape "${partShape.name}" has invalid fieldMetadata`);
        continue;
      }

      console.log(`   Processing PartShape "${partShape.name}" (${Object.keys(fieldMetadata).length} fields)`);

      for (const [fieldKey, config] of Object.entries(fieldMetadata)) {
        try {
          // Validate required properties
          if (!config || typeof config !== 'object') {
            stats.warnings.push(`PartShape "${partShape.name}" field "${fieldKey}" has invalid config`);
            continue;
          }

          // Check if this layout config already exists
          const existing = await queryInterface.sequelize.query(
            `SELECT id FROM shape_layout_config 
             WHERE shape_id = :shapeId 
             AND shape_type = 'part' 
             AND field_key = :fieldKey`,
            {
              type: queryInterface.sequelize.QueryTypes.SELECT,
              replacements: { shapeId: partShape.id, fieldKey },
            }
          );

          if (existing.length > 0) {
            console.log(`      ⏭️  Skipping ${fieldKey} (already exists)`);
            continue;
          }

          // Verify canonical field metadata exists
          const canonicalExists = await queryInterface.sequelize.query(
            `SELECT id FROM shape_field_metadata 
             WHERE entity_type = 'part' 
             AND field_key = :fieldKey`,
            {
              type: queryInterface.sequelize.QueryTypes.SELECT,
              replacements: { fieldKey },
            }
          );

          if (canonicalExists.length === 0) {
            stats.warnings.push(
              `PartShape "${partShape.name}" field "${fieldKey}" has no canonical metadata - skipping`
            );
            continue;
          }

          // Insert into shape_layout_config
          await queryInterface.bulkInsert('shape_layout_config', [{
            id: uuidv4(),
            shape_id: partShape.id,
            shape_type: 'part',
            field_key: fieldKey,
            visibility: config.visibility || 'hidden',
            layout: config.layout || 'stacked',
            order: config.order !== undefined ? config.order : 0,
            section: null,
            render_as: config.renderAs || 'field',
            status_button_color: config.statusButtonColor || null,
            panel: config.panel || 'none',
            bulk_edit: config.bulkEdit !== undefined ? config.bulkEdit : false,
            created_at: new Date(),
            updated_at: new Date(),
          }]);

          stats.layoutConfigsCreated++;
          console.log(`      ✅ Migrated ${fieldKey}`);
        } catch (error) {
          stats.errors.push({
            shape: `PartShape "${partShape.name}"`,
            field: fieldKey,
            error: error.message,
          });
          console.error(`      ❌ Error migrating ${fieldKey}:`, error.message);
        }
      }
    }

    // Print migration summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`BlockShapes processed: ${stats.blockShapesProcessed}`);
    console.log(`PartShapes processed: ${stats.partShapesProcessed}`);
    console.log(`Layout configs created: ${stats.layoutConfigsCreated}`);
    console.log(`Warnings: ${stats.warnings.length}`);
    console.log(`Errors: ${stats.errors.length}`);

    if (stats.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      stats.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.shape} - ${error.field}: ${error.error}`);
      });
    }

    console.log('='.repeat(60));
    console.log('✅ Migration completed');
    console.log('ℹ️  Note: Original fieldMetadata JSONB columns remain intact for rollback safety');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting fieldMetadata migration...');
    
    // Delete all migrated layout configs
    // This only removes configs that were migrated, not manually created ones
    console.log('   Removing migrated layout configs...');
    
    await queryInterface.sequelize.query(
      `DELETE FROM shape_layout_config 
       WHERE shape_type IN ('block', 'part')`
    );

    console.log('✅ Migration reverted');
    console.log('ℹ️  Original fieldMetadata JSONB columns remain intact');
  }
};
