/**
 * One-time cleanup script: Remove relationship keys from admin_primitive_metadata
 * 
 * LEARNING: Forcefully removes relationship keys that should not exist in primitive metadata
 * WHY: Relationship keys belong in admin_relationship_metadata, not admin_primitive_metadata
 * PATTERN: Direct SQL DELETE to ensure removal even if migrations failed
 * 
 * Run with: node server/src/scripts/cleanup-relationship-keys-from-primitive-metadata.mjs
 */

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({ path: './.env.development' });

// Relationship keys that should NOT be in primitive metadata
const relationshipKeys = [
  'validCascades',
  'validParts',
  'bookingCascades',
  'activeParts',
  'instanceComponents',
  'dependentInstanceOptions',
  // Old names that might have been used before renaming
  'activeConstituents', // Old name for activeParts
  'validConstituents', // Old name for validParts
];

async function cleanupRelationshipKeys() {
  console.log('🔄 Starting cleanup of relationship keys from admin_primitive_metadata...');
  
  // Use same connection method as migrations
  const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS || '';
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'scheduler_db',
    username: process.env.DB_USER || 'postgres',
    password: String(dbPassword || ''),
    dialect: 'postgres',
    logging: false,
  };

  const sequelize = new Sequelize(dbConfig);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
  
    // Check what exists before deletion
    const relationshipKeysArray = relationshipKeys.map(key => `'${key.replace(/'/g, "''")}'`).join(',');
    
    const [existing] = await sequelize.query(`
      SELECT entity_type, entity_id, field_key
      FROM admin_primitive_metadata
      WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
      ORDER BY entity_type, entity_id, field_key
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`📋 Found ${existing.length} relationship key entries that should not exist:`);
      existing.forEach(entry => {
        console.log(`   - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
      });

      // Force delete using raw SQL
      console.log('\n🗑️  Deleting relationship keys...');
      const [deletedResult] = await sequelize.query(`
        DELETE FROM admin_primitive_metadata
        WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
        RETURNING entity_type, entity_id, field_key
      `, {
        type: Sequelize.QueryTypes.DELETE,
      });

      const deletedCount = Array.isArray(deletedResult) ? deletedResult.length : 0;
      console.log(`✅ Successfully deleted ${deletedCount} relationship key entries`);
      
      if (deletedCount > 0 && Array.isArray(deletedResult)) {
        console.log('\n   Deleted entries:');
        deletedResult.forEach(entry => {
          console.log(`     - ${entry.entity_type}/${entry.entity_id}: ${entry.field_key}`);
        });
      }

      // Verify deletion
      const [remaining] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM admin_primitive_metadata
        WHERE field_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
      `, {
        type: Sequelize.QueryTypes.SELECT,
      });

      const remainingCount = remaining?.[0]?.count || 0;
      if (remainingCount === 0) {
        console.log('\n✅ Verification: No relationship keys remaining in admin_primitive_metadata');
      } else {
        console.log(`\n⚠️  Warning: ${remainingCount} relationship keys still remain (this should not happen)`);
      }

      // Verify they exist in relationship metadata (for validation)
      const [inRelationshipMetadata] = await sequelize.query(`
        SELECT DISTINCT relationship_key
        FROM admin_relationship_metadata
        WHERE relationship_key = ANY(ARRAY[${relationshipKeysArray}]::text[])
        ORDER BY relationship_key
      `, {
        type: Sequelize.QueryTypes.SELECT,
      });

      if (Array.isArray(inRelationshipMetadata) && inRelationshipMetadata.length > 0) {
        const foundKeys = inRelationshipMetadata.map(r => r.relationship_key);
        console.log(`\n✅ Verified relationship keys exist in admin_relationship_metadata: ${foundKeys.join(', ')}`);
      } else {
        console.log('\n⚠️  Warning: No relationship keys found in admin_relationship_metadata');
        console.log('   This might indicate that relationship metadata needs to be seeded');
      }

    } else {
      console.log('✅ No relationship keys found in admin_primitive_metadata (already clean)');
    }

    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the cleanup
cleanupRelationshipKeys()
  .then(() => {
    console.log('\n🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
