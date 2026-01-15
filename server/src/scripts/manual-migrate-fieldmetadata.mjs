/**
 * Manual migration script to transfer fieldMetadata from JSONB to new tables
 * Run with: node src/scripts/manual-migrate-fieldmetadata.mjs
 */

import { v4 as uuidv4 } from 'uuid';
import { initSequelize } from '../db/index.js';

async function runMigration() {
  console.log('🔄 Starting manual fieldMetadata migration...\n');

  const { sequelize } = await initSequelize();
  console.log('   ✅ Connected to database\n');

  const stats = {
    blockShapesProcessed: 0,
    partShapesProcessed: 0,
    layoutConfigsCreated: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Clear existing migrated data
    console.log('🧹 Clearing existing shape_layout_config entries...');
    await sequelize.query('DELETE FROM shape_layout_config');
    console.log('   ✅ Cleared\n');

    // Migrate BlockShape fieldMetadata
    console.log('📋 Migrating BlockShape fieldMetadata...');
    
    const [blockShapes] = await sequelize.query(
      `SELECT id, name, field_metadata FROM block_shapes WHERE field_metadata IS NOT NULL`
    );

    console.log(`   Found ${blockShapes.length} BlockShapes with fieldMetadata\n`);

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
          if (!config || typeof config !== 'object') {
            stats.warnings.push(`BlockShape "${blockShape.name}" field "${fieldKey}" has invalid config`);
            continue;
          }

          // Verify canonical field metadata exists
          const [canonicalExists] = await sequelize.query(
            `SELECT id FROM shape_field_metadata 
             WHERE entity_type = 'block' 
             AND field_key = :fieldKey`,
            { replacements: { fieldKey } }
          );

          if (canonicalExists.length === 0) {
            stats.warnings.push(
              `BlockShape "${blockShape.name}" field "${fieldKey}" has no canonical metadata - skipping`
            );
            continue;
          }

          // Insert into shape_layout_config
          await sequelize.query(
            `INSERT INTO shape_layout_config 
             (id, shape_id, shape_type, field_key, visibility, layout, "order", section, render_as, status_button_color, panel, bulk_edit, created_at, updated_at)
             VALUES (:id, :shapeId, :shapeType, :fieldKey, :visibility, :layout, :order, :section, :renderAs, :statusButtonColor, :panel, :bulkEdit, :createdAt, :updatedAt)`,
            {
              replacements: {
                id: uuidv4(),
                shapeId: blockShape.id,
                shapeType: 'block',
                fieldKey: fieldKey,
                visibility: config.visibility || 'hidden',
                layout: config.layout || 'stacked',
                order: config.order !== undefined ? config.order : 0,
                section: null,
                renderAs: config.renderAs || 'field',
                statusButtonColor: config.statusButtonColor || null,
                panel: config.panel || 'none',
                bulkEdit: config.bulkEdit !== undefined ? config.bulkEdit : false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
          );

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
    
    const [partShapes] = await sequelize.query(
      `SELECT id, name, field_metadata FROM part_shapes WHERE field_metadata IS NOT NULL`
    );

    console.log(`   Found ${partShapes.length} PartShapes with fieldMetadata\n`);

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
          if (!config || typeof config !== 'object') {
            stats.warnings.push(`PartShape "${partShape.name}" field "${fieldKey}" has invalid config`);
            continue;
          }

          // Verify canonical field metadata exists
          const [canonicalExists] = await sequelize.query(
            `SELECT id FROM shape_field_metadata 
             WHERE entity_type = 'part' 
             AND field_key = :fieldKey`,
            { replacements: { fieldKey } }
          );

          if (canonicalExists.length === 0) {
            stats.warnings.push(
              `PartShape "${partShape.name}" field "${fieldKey}" has no canonical metadata - skipping`
            );
            continue;
          }

          // Insert into shape_layout_config
          await sequelize.query(
            `INSERT INTO shape_layout_config 
             (id, shape_id, shape_type, field_key, visibility, layout, "order", section, render_as, status_button_color, panel, bulk_edit, created_at, updated_at)
             VALUES (:id, :shapeId, :shapeType, :fieldKey, :visibility, :layout, :order, :section, :renderAs, :statusButtonColor, :panel, :bulkEdit, :createdAt, :updatedAt)`,
            {
              replacements: {
                id: uuidv4(),
                shapeId: partShape.id,
                shapeType: 'part',
                fieldKey: fieldKey,
                visibility: config.visibility || 'hidden',
                layout: config.layout || 'stacked',
                order: config.order !== undefined ? config.order : 0,
                section: null,
                renderAs: config.renderAs || 'field',
                statusButtonColor: config.statusButtonColor || null,
                panel: config.panel || 'none',
                bulkEdit: config.bulkEdit !== undefined ? config.bulkEdit : false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
          );

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
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
