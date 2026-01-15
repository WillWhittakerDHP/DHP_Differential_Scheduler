/**
 * Fix missing layout configs for shapes that have field_metadata but no layout configs
 * This handles the case where the migration ran before canonical metadata was seeded
 */

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: './.env.development' });

async function fixMissingConfigs() {
  // Use same connection method as migrations
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'scheduler_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'jklJKL',
    dialect: 'postgres',
    logging: false,
  };

  const sequelize = new Sequelize(dbConfig);

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Find BlockShapes with field_metadata but no layout configs
    const blockShapesNeedingMigration = await sequelize.query(`
      SELECT bs.id, bs.name, bs.field_metadata
      FROM block_shapes bs
      WHERE bs.field_metadata IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 
          FROM shape_layout_config slc 
          WHERE slc.shape_id = bs.id 
          AND slc.shape_type = 'block'
        )
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log(`Found ${blockShapesNeedingMigration.length} BlockShapes needing migration\n`);

    let totalCreated = 0;
    let totalSkipped = 0;
    const errors = [];

    for (const blockShape of blockShapesNeedingMigration) {
      console.log(`Processing BlockShape: ${blockShape.name} (${blockShape.id})`);
      const fieldMetadata = blockShape.field_metadata;

      if (!fieldMetadata || typeof fieldMetadata !== 'object') {
        console.log(`  ⚠️  Invalid field_metadata, skipping\n`);
        continue;
      }

      const fieldKeys = Object.keys(fieldMetadata);
      console.log(`  Found ${fieldKeys.length} fields in field_metadata`);

      for (const [fieldKey, config] of Object.entries(fieldMetadata)) {
        try {
          if (!config || typeof config !== 'object') {
            console.log(`    ⚠️  Invalid config for ${fieldKey}, skipping`);
            totalSkipped++;
            continue;
          }

          // Check if canonical metadata exists
          const canonicalExists = await sequelize.query(
            `SELECT id FROM shape_field_metadata 
             WHERE entity_type = 'block' 
             AND field_key = :fieldKey`,
            {
              replacements: { fieldKey },
              type: Sequelize.QueryTypes.SELECT,
            }
          );

          if (canonicalExists.length === 0) {
            console.log(`    ⚠️  No canonical metadata for ${fieldKey}, skipping`);
            totalSkipped++;
            continue;
          }

          // Check if layout config already exists
          const existing = await sequelize.query(
            `SELECT id FROM shape_layout_config 
             WHERE shape_id = :shapeId 
             AND shape_type = 'block' 
             AND field_key = :fieldKey`,
            {
              replacements: { shapeId: blockShape.id, fieldKey },
              type: Sequelize.QueryTypes.SELECT,
            }
          );

          if (existing.length > 0) {
            console.log(`    ⏭️  Layout config for ${fieldKey} already exists, skipping`);
            totalSkipped++;
            continue;
          }

          // Insert layout config
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

          console.log(`    ✅ Created layout config for ${fieldKey}`);
          totalCreated++;
        } catch (error) {
          console.error(`    ❌ Error migrating ${fieldKey}:`, error.message);
          errors.push({
            shape: blockShape.name,
            field: fieldKey,
            error: error.message,
          });
        }
      }
      console.log('');
    }

    // Do the same for PartShapes
    const partShapesNeedingMigration = await sequelize.query(`
      SELECT ps.id, ps.name, ps.field_metadata
      FROM part_shapes ps
      WHERE ps.field_metadata IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 
          FROM shape_layout_config slc 
          WHERE slc.shape_id = ps.id 
          AND slc.shape_type = 'part'
        )
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log(`Found ${partShapesNeedingMigration.length} PartShapes needing migration\n`);

    for (const partShape of partShapesNeedingMigration) {
      console.log(`Processing PartShape: ${partShape.name} (${partShape.id})`);
      const fieldMetadata = partShape.field_metadata;

      if (!fieldMetadata || typeof fieldMetadata !== 'object') {
        console.log(`  ⚠️  Invalid field_metadata, skipping\n`);
        continue;
      }

      const fieldKeys = Object.keys(fieldMetadata);
      console.log(`  Found ${fieldKeys.length} fields in field_metadata`);

      for (const [fieldKey, config] of Object.entries(fieldMetadata)) {
        try {
          if (!config || typeof config !== 'object') {
            console.log(`    ⚠️  Invalid config for ${fieldKey}, skipping`);
            totalSkipped++;
            continue;
          }

          // Check if canonical metadata exists
          const canonicalExists = await sequelize.query(
            `SELECT id FROM shape_field_metadata 
             WHERE entity_type = 'part' 
             AND field_key = :fieldKey`,
            {
              replacements: { fieldKey },
              type: Sequelize.QueryTypes.SELECT,
            }
          );

          if (canonicalExists.length === 0) {
            console.log(`    ⚠️  No canonical metadata for ${fieldKey}, skipping`);
            totalSkipped++;
            continue;
          }

          // Check if layout config already exists
          const existing = await sequelize.query(
            `SELECT id FROM shape_layout_config 
             WHERE shape_id = :shapeId 
             AND shape_type = 'part' 
             AND field_key = :fieldKey`,
            {
              replacements: { shapeId: partShape.id, fieldKey },
              type: Sequelize.QueryTypes.SELECT,
            }
          );

          if (existing.length > 0) {
            console.log(`    ⏭️  Layout config for ${fieldKey} already exists, skipping`);
            totalSkipped++;
            continue;
          }

          // Insert layout config
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

          console.log(`    ✅ Created layout config for ${fieldKey}`);
          totalCreated++;
        } catch (error) {
          console.error(`    ❌ Error migrating ${fieldKey}:`, error.message);
          errors.push({
            shape: partShape.name,
            field: fieldKey,
            error: error.message,
          });
        }
      }
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log(`Layout configs created: ${totalCreated}`);
    console.log(`Fields skipped: ${totalSkipped}`);
    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.shape} - ${err.field}: ${err.error}`);
      });
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixMissingConfigs().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
