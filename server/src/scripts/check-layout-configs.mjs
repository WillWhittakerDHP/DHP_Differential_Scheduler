/**
 * Quick script to check if layout configs exist in the database
 */

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({ path: './.env.development' });

async function checkLayoutConfigs() {
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

    // Check total count
    const [totalResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM shape_layout_config'
    );
    console.log(`Total layout configs: ${totalResult[0].count}\n`);

    // Check by shape type
    const [byTypeResult] = await sequelize.query(`
      SELECT shape_type, COUNT(*) as count 
      FROM shape_layout_config 
      GROUP BY shape_type
    `);
    console.log('Layout configs by type:');
    byTypeResult.forEach(row => {
      console.log(`  ${row.shape_type}: ${row.count}`);
    });
    console.log('');

    // Get sample block shapes
    const [blockShapes] = await sequelize.query(`
      SELECT id, name 
      FROM block_shapes 
      LIMIT 5
    `);
    console.log('Sample BlockShapes:');
    blockShapes.forEach(shape => {
      console.log(`  ${shape.id} - ${shape.name || '(no name)'}`);
    });
    console.log('');

    // Check layout configs for first block shape
    if (blockShapes.length > 0) {
      const firstShapeId = blockShapes[0].id;
      const [configs] = await sequelize.query(`
        SELECT field_key, visibility, layout, "order"
        FROM shape_layout_config
        WHERE shape_id = :shapeId AND shape_type = 'block'
        ORDER BY "order", field_key
        LIMIT 10
      `, {
        replacements: { shapeId: firstShapeId }
      });

      console.log(`Layout configs for BlockShape ${firstShapeId}:`);
      if (configs.length === 0) {
        console.log('  ❌ No layout configs found!');
      } else {
        configs.forEach(config => {
          console.log(`  ${config.field_key}: ${config.visibility} (${config.layout}, order: ${config.order})`);
        });
      }
    }

    // Check if any block_shapes have field_metadata
    const [blockShapesWithMetadata] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM block_shapes 
      WHERE field_metadata IS NOT NULL
    `);
    console.log(`\nBlockShapes with field_metadata JSONB: ${blockShapesWithMetadata[0].count}`);

    // Check if any part_shapes have field_metadata
    const [partShapesWithMetadata] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM part_shapes 
      WHERE field_metadata IS NOT NULL
    `);
    console.log(`PartShapes with field_metadata JSONB: ${partShapesWithMetadata[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

checkLayoutConfigs().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
