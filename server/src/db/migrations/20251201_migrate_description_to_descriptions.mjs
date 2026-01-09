/**
 * Migration: Migrate existing description strings to descriptions system
 * Date: 2025-12-01
 * Purpose: Migrate existing `description` string values from block_instances table to the new descriptions system
 * 
 * LEARNING: This migration:
 * - Finds all block_instances with non-empty `description` values
 * - Creates Description entities for each unique description text
 * - Creates BlockInstanceDescription relationships linking block instances to descriptions
 * - Sets isDefault=true and orderIndex=0 for migrated descriptions
 * 
 * WHY: Migrating existing data ensures backward compatibility while moving to the new system
 * PATTERN: Idempotent migration - checks if description already exists before creating
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if descriptions table exists (must run after create_descriptions_system migration)
    const descriptionsTableExists = await queryInterface.tableExists('descriptions');
    const blockInstanceDescriptionsTableExists = await queryInterface.tableExists('block_instance_descriptions');
    
    if (!descriptionsTableExists || !blockInstanceDescriptionsTableExists) {
      console.log('⚠️  Descriptions system tables do not exist. Please run create_descriptions_system migration first.');
      return;
    }

    // Get all block instances with non-empty description values
    const [blockInstances] = await queryInterface.sequelize.query(`
      SELECT id, description 
      FROM block_instances 
      WHERE description IS NOT NULL 
        AND description != '' 
        AND description != ' '
        AND id NOT IN (
          SELECT DISTINCT block_instance_id 
          FROM block_instance_descriptions
        )
    `);

    console.log(`📋 Found ${blockInstances.length} block instances with descriptions to migrate`);

    if (blockInstances.length === 0) {
      console.log('✅ No block instances need migration');
      return;
    }

    // Track created descriptions to avoid duplicates
    const descriptionTextToId = new Map();
    let migratedCount = 0;
    let skippedCount = 0;

    for (const blockInstance of blockInstances) {
      const descriptionText = blockInstance.description.trim();
      
      if (!descriptionText) {
        skippedCount++;
        continue;
      }

      // Check if description already exists (by text)
      let descriptionId = descriptionTextToId.get(descriptionText);
      
      if (!descriptionId) {
        // Check database for existing description with same text
        const [existingDescriptions] = await queryInterface.sequelize.query(`
          SELECT id FROM descriptions WHERE text = :text LIMIT 1
        `, {
          replacements: { text: descriptionText }
        });

        if (existingDescriptions.length > 0) {
          descriptionId = existingDescriptions[0].id;
          descriptionTextToId.set(descriptionText, descriptionId);
        } else {
          // Create new Description entity
          const newDescriptionId = Sequelize.fn('gen_random_uuid');
          
          await queryInterface.sequelize.query(`
            INSERT INTO descriptions (id, text, user_type, created_at, updated_at)
            VALUES (gen_random_uuid(), :text, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
          `, {
            replacements: { text: descriptionText },
            type: Sequelize.QueryTypes.INSERT
          });

          // Get the created description ID
          const [createdDescriptions] = await queryInterface.sequelize.query(`
            SELECT id FROM descriptions WHERE text = :text LIMIT 1
          `, {
            replacements: { text: descriptionText }
          });

          if (createdDescriptions.length > 0) {
            descriptionId = createdDescriptions[0].id;
            descriptionTextToId.set(descriptionText, descriptionId);
          } else {
            console.error(`❌ Failed to create description for block instance ${blockInstance.id}`);
            skippedCount++;
            continue;
          }
        }
      }

      // Create BlockInstanceDescription relationship
      // Check if relationship already exists
      const [existingRelationships] = await queryInterface.sequelize.query(`
        SELECT id FROM block_instance_descriptions 
        WHERE block_instance_id = :blockInstanceId AND description_id = :descriptionId
      `, {
        replacements: { 
          blockInstanceId: blockInstance.id,
          descriptionId: descriptionId
        }
      });

      if (existingRelationships.length === 0) {
        await queryInterface.sequelize.query(`
          INSERT INTO block_instance_descriptions (
            id, 
            block_instance_id, 
            description_id, 
            user_type, 
            order_index, 
            is_default, 
            created_at, 
            updated_at
          )
          VALUES (
            gen_random_uuid(),
            :blockInstanceId,
            :descriptionId,
            NULL,
            0,
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `, {
          replacements: {
            blockInstanceId: blockInstance.id,
            descriptionId: descriptionId
          }
        });

        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`✅ Migration complete:`);
    console.log(`   - Migrated: ${migratedCount} block instances`);
    console.log(`   - Skipped: ${skippedCount} block instances (already migrated or empty)`);
    console.log(`   - Created: ${descriptionTextToId.size} unique descriptions`);
  },

  async down(queryInterface, Sequelize) {
    // LEARNING: Down migration removes migrated descriptions
    // WHY: Allows rolling back the migration if needed
    // PATTERN: Remove BlockInstanceDescription relationships created by this migration
    // NOTE: We don't delete Description entities as they might be used by other block instances
    
    console.log('⚠️  Rolling back description migration...');
    console.log('   Note: Description entities will not be deleted (may be used by other block instances)');
    
    // Find all BlockInstanceDescription relationships that were created by migration
    // (those with is_default=true, order_index=0, and user_type=NULL)
    // This is a best-effort approach - we can't perfectly identify migrated relationships
    
    const [relationships] = await queryInterface.sequelize.query(`
      SELECT id FROM block_instance_descriptions
      WHERE is_default = true 
        AND order_index = 0 
        AND user_type IS NULL
    `);

    if (relationships.length > 0) {
      await queryInterface.sequelize.query(`
        DELETE FROM block_instance_descriptions
        WHERE is_default = true 
          AND order_index = 0 
          AND user_type IS NULL
      `);
      
      console.log(`✅ Removed ${relationships.length} migrated relationships`);
    } else {
      console.log('ℹ️  No migrated relationships found to remove');
    }
  }
};

