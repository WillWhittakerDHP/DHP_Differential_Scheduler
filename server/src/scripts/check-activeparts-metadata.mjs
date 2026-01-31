import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'jklJKL',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function checkPartAssignmentsMetadata() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, entity_type, entity_id, field_key, render_as, block_shape_ref, metadata_type
      FROM admin_metadata
      WHERE field_key = 'partAssignments'
      ORDER BY entity_type, entity_id, block_shape_ref NULLS LAST;
    `);
    
    console.log('PartAssignments metadata entries:');
    console.log(JSON.stringify(results, null, 2));
    
    if (results.length === 0) {
      console.log('\n⚠️  No activeParts metadata found!');
    } else {
      const wrongRenderAs = results.filter(r => r.render_as !== 'relationshipCollection');
      if (wrongRenderAs.length > 0) {
        console.log('\n❌ Found entries with incorrect render_as:');
        wrongRenderAs.forEach(r => {
          console.log(`  - ${r.entity_type}.${r.entity_id} (blockShapeRef: ${r.block_shape_ref || 'NULL'}): render_as = '${r.render_as}'`);
        });
      } else {
        console.log('\n✅ All partAssignments entries have render_as = "relationshipCollection"');
      }
    }
  } catch (error) {
    console.error('Error checking metadata:', error);
  } finally {
    await sequelize.close();
  }
}

checkPartAssignmentsMetadata();
