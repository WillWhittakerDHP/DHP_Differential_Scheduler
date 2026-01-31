/**
 * Fix Script: Clean up relationship keys from admin_primitive_metadata
 * 
 * Purpose: Remove incorrectly added relationship keys from primitive metadata table
 *          and clean up legacy entity_layout_config entries to prevent re-migration
 * 
 * Run with: node server/src/scripts/fix-primitive-metadata-cleanup.mjs
 */

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
    logging: console.log,
  }
);

async function cleanup() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const relationshipKeys = [
      'validCascades',
      'validParts',
      'bookingCascades',
      'partAssignments',
      'instanceComponents',
      'dependentInstances', // Current name
      'dependentInstanceOptions', // Old name - catch legacy data
      // Old names
      'activeConstituents',
      'validConstituents',
    ];

    const relationshipKeysArray = relationshipKeys.map(key => `'${key}'`).join(',');

    console.log('\n📋 Step 1: Check admin_primitive_metadata for relationship keys...');
    
    // Check what exists
    const [existingPrimitive] = await sequelize.query(`
      SELECT id, entity_type, entity_id, field_key, created_at
      FROM admin_primitive_metadata
      WHERE field_key IN (${relationshipKeysArray})
      ORDER BY entity_type, field_key
    `);

    if (existingPrimitive.length > 0) {
      console.log(`Found ${existingPrimitive.length} relationship key entries to delete:`);
      existingPrimitive.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key} (created: ${entry.created_at})`);
      });

      // Delete them
      const [deletedResult] = await sequelize.query(`
        DELETE FROM admin_primitive_metadata
        WHERE field_key IN (${relationshipKeysArray})
        RETURNING entity_type, entity_id, field_key
      `);

      console.log(`✅ Deleted ${deletedResult.length} entries from admin_primitive_metadata`);
    } else {
      console.log('✅ No relationship keys found in admin_primitive_metadata (already clean)');
    }

    console.log('\n📋 Step 2: Check entity_layout_config for relationship keys...');

    // Check if entity_layout_config exists and has relationship keys
    const [tableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'entity_layout_config'
      ) as exists
    `);

    if (tableExists[0]?.exists) {
      const [existingLayout] = await sequelize.query(`
        SELECT id, entity_type, entity_id, field_key
        FROM entity_layout_config
        WHERE field_key IN (${relationshipKeysArray})
        ORDER BY entity_type, field_key
      `);

      if (existingLayout.length > 0) {
        console.log(`Found ${existingLayout.length} relationship key entries in entity_layout_config:`);
        existingLayout.forEach(entry => {
          console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
        });

        // Delete them to prevent re-migration
        const [deletedLayout] = await sequelize.query(`
          DELETE FROM entity_layout_config
          WHERE field_key IN (${relationshipKeysArray})
          RETURNING entity_type, entity_id, field_key
        `);

        console.log(`✅ Deleted ${deletedLayout.length} entries from entity_layout_config`);
      } else {
        console.log('✅ No relationship keys found in entity_layout_config (already clean)');
      }
    } else {
      console.log('ℹ️  entity_layout_config table does not exist (already dropped)');
    }

    console.log('\n✅ Cleanup completed successfully!');

    // Verify
    console.log('\n📋 Verification...');
    const [remaining] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM admin_primitive_metadata
      WHERE field_key IN (${relationshipKeysArray})
    `);
    console.log(`   Relationship keys in admin_primitive_metadata: ${remaining[0]?.count || 0}`);

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

cleanup();
