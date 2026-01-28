/**
 * Check a specific shape's field_metadata and layout configs
 */

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({ path: './.env.development' });

const shapeId = process.argv[2] || 'c6e7ec8a-ed79-4280-b54c-3e8b75155168';

async function checkShape() {
  const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'scheduler_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    dialect: 'postgres',
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check BlockShape
    const [blockShapes] = await sequelize.query(
      `SELECT id, name, field_metadata IS NOT NULL as has_field_metadata, 
              jsonb_typeof(field_metadata) as metadata_type,
              jsonb_object_keys(field_metadata) as metadata_keys
       FROM block_shapes 
       WHERE id = :shapeId`,
      {
        replacements: { shapeId },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (blockShapes.length === 0) {
      console.log(`❌ BlockShape ${shapeId} not found`);
      return;
    }

    const shape = blockShapes[0];
    console.log(`BlockShape: ${shape.name} (${shape.id})`);
    console.log(`Has field_metadata: ${shape.has_field_metadata}`);
    console.log(`Metadata type: ${shape.metadata_type}\n`);

    // Get full field_metadata
    const [fullMetadata] = await sequelize.query(
      `SELECT field_metadata 
       FROM block_shapes 
       WHERE id = :shapeId`,
      {
        replacements: { shapeId },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (fullMetadata[0]?.field_metadata) {
      console.log('Field metadata keys:', Object.keys(fullMetadata[0].field_metadata));
      console.log('Field metadata sample:', JSON.stringify(fullMetadata[0].field_metadata, null, 2).substring(0, 500));
    }

    // Check layout configs
    const [layoutConfigs] = await sequelize.query(
      `SELECT field_key, visibility, layout, "order"
       FROM shape_layout_config
       WHERE shape_id = :shapeId AND shape_type = 'block'
       ORDER BY "order", field_key`,
      {
        replacements: { shapeId },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    console.log(`\nLayout configs in new table: ${layoutConfigs.length}`);
    if (layoutConfigs.length > 0) {
      layoutConfigs.forEach(config => {
        console.log(`  ${config.field_key}: ${config.visibility} (${config.layout}, order: ${config.order})`);
      });
    } else {
      console.log('  ❌ No layout configs found!');
    }

    // Check canonical metadata
    const [canonicalMetadata] = await sequelize.query(
      `SELECT field_key, label, display_order
       FROM shape_field_metadata
       WHERE entity_type = 'block'
       ORDER BY display_order, field_key
       LIMIT 10`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    console.log(`\nCanonical metadata (first 10): ${canonicalMetadata.length} fields`);
    canonicalMetadata.forEach(meta => {
      console.log(`  ${meta.field_key}: ${meta.label} (order: ${meta.display_order})`);
    });

    // Check if migration ran
    const [migrationRan] = await sequelize.query(
      `SELECT name FROM "SequelizeMeta" 
       WHERE name = '20260115_migrate_field_metadata_to_new_tables.mjs'`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    console.log(`\nMigration ran: ${migrationRan.length > 0 ? '✅ Yes' : '❌ No'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

checkShape().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
