/**
 * Migration: Migrate Additional Services to Base Services
 * Purpose: Update all block_instances that reference "Additional Service" blockShape 
 *          to reference "Base Service" (service) blockShape instead
 *          This consolidates additional services into base services as per new architecture
 * Date: 2025-01-31
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting migration: Migrate Additional Services to Base Services');
    
    // Step 1: Find the Base Service blockShape UUID (check both "service" and "Base Service")
    const [baseServiceBlockShape] = await queryInterface.sequelize.query(
      `SELECT id FROM block_shapes 
       WHERE name = 'service' OR name = 'Base Service' 
       LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (!baseServiceBlockShape) {
      console.log('⚠️  Base Service blockShape not found. Migration may not be needed or block shapes not seeded yet.');
      return;
    }
    
    const baseServiceBlockShapeId = baseServiceBlockShape.id;
    console.log(`✅ Found Base Service blockShape: ${baseServiceBlockShapeId}`);
    
    // Step 2: Find any "Additional Service" blockShape (check various possible names)
    const [additionalServiceBlockShape] = await queryInterface.sequelize.query(
      `SELECT id FROM block_shapes 
       WHERE LOWER(name) LIKE '%additional%service%' 
          OR LOWER(name) = 'additional_service'
          OR LOWER(name) = 'additional service'
       LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (additionalServiceBlockShape) {
      const additionalServiceBlockShapeId = additionalServiceBlockShape.id;
      console.log(`✅ Found Additional Service blockShape: ${additionalServiceBlockShapeId}`);
      
      // Step 3: Check how many block_instances reference Additional Service blockShape
      const [countResult] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM block_instances WHERE block_shape_ref = :additionalServiceId;`,
        {
          replacements: { additionalServiceId: additionalServiceBlockShapeId },
          type: Sequelize.QueryTypes.SELECT
        }
      );
      
      const countToUpdate = parseInt(countResult.count) || 0;
      console.log(`📊 Found ${countToUpdate} block_instances referencing Additional Service blockShape`);
      
      // Step 4: Update all block_instances that reference Additional Service blockShape
      if (countToUpdate > 0) {
        await queryInterface.sequelize.query(
          `UPDATE block_instances 
           SET block_shape_ref = :baseServiceId
           WHERE block_shape_ref = :additionalServiceId;`,
          {
            replacements: {
              baseServiceId: baseServiceBlockShapeId,
              additionalServiceId: additionalServiceBlockShapeId
            },
            type: Sequelize.QueryTypes.UPDATE
          }
        );
        
        // Verify the update worked
        const [verifyResult] = await queryInterface.sequelize.query(
          `SELECT COUNT(*) as count FROM block_instances WHERE block_shape_ref = :additionalServiceId;`,
          {
            replacements: { additionalServiceId: additionalServiceBlockShapeId },
            type: Sequelize.QueryTypes.SELECT
          }
        );
        
        const remainingCount = parseInt(verifyResult.count) || 0;
        if (remainingCount > 0) {
          console.log(`⚠️  Warning: ${remainingCount} block_instances still reference Additional Service blockShape`);
          throw new Error(`Cannot delete Additional Service blockShape: ${remainingCount} block_instances still reference it`);
        }
        
        console.log(`✅ Successfully updated ${countToUpdate} block_instances to use Base Service blockShape`);
      } else {
        console.log(`ℹ️  No block_instances found referencing Additional Service blockShape`);
      }
      
      // Step 5: Update valid_cascades relationships if they reference Additional Service blockShape
      const [validCascadeUpdate] = await queryInterface.sequelize.query(
        `UPDATE valid_cascades 
         SET child_id = :baseServiceId
         WHERE child_id = :additionalServiceId;`,
        {
          replacements: {
            baseServiceId: baseServiceBlockShapeId,
            additionalServiceId: additionalServiceBlockShapeId
          },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      
      console.log(`✅ Updated valid_cascades relationships`);
      
      // Step 6: Also update parent_id in valid_cascades if needed (handles cascade relationships)
      const [validCascadeParentUpdate] = await queryInterface.sequelize.query(
        `UPDATE valid_cascades 
         SET parent_id = :baseServiceId
         WHERE parent_id = :additionalServiceId;`,
        {
          replacements: {
            baseServiceId: baseServiceBlockShapeId,
            additionalServiceId: additionalServiceBlockShapeId
          },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      
      console.log(`✅ Updated valid_cascades parent relationships`);
      
      // Step 7: Verify no remaining references before deleting
      // Check block_instances
      const [finalCheckInstances] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM block_instances WHERE block_shape_ref = :additionalServiceId;`,
        {
          replacements: { additionalServiceId: additionalServiceBlockShapeId },
          type: Sequelize.QueryTypes.SELECT
        }
      );
      
      // Check valid_cascades (both parent and child)
      const [finalCheckCascades] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM valid_cascades 
         WHERE parent_id = :additionalServiceId OR child_id = :additionalServiceId;`,
        {
          replacements: { additionalServiceId: additionalServiceBlockShapeId },
          type: Sequelize.QueryTypes.SELECT
        }
      );
      
      const remainingInstances = parseInt(finalCheckInstances.count) || 0;
      const remainingCascades = parseInt(finalCheckCascades.count) || 0;
      
      if (remainingInstances > 0 || remainingCascades > 0) {
        console.log(`❌ Cannot delete Additional Service blockShape:`);
        console.log(`   - ${remainingInstances} block_instances still reference it`);
        console.log(`   - ${remainingCascades} valid_cascades still reference it`);
        throw new Error(`Cannot delete Additional Service blockShape: ${remainingInstances} block_instances and ${remainingCascades} valid_cascades still reference it`);
      }
      
      // Step 8: Delete the Additional Service blockShape (after all references are updated)
      await queryInterface.sequelize.query(
        `DELETE FROM block_shapes WHERE id = :additionalServiceId;`,
        {
          replacements: { additionalServiceId: additionalServiceBlockShapeId },
          type: Sequelize.QueryTypes.DELETE
        }
      );
      
      console.log(`✅ Deleted Additional Service blockShape`);
    } else {
      console.log('ℹ️  No Additional Service blockShape found in database. This may mean:');
      console.log('   1. Additional Service was never created as a blockShape');
      console.log('   2. Additional Service was already removed');
      console.log('   3. Block instances with blockShapeRef: 3 in seeds refer to a different blockShape');
      console.log('   Migration will continue to check for any orphaned block instances...');
      
      // Check if there are any block_instances that might need updating
      // This handles the case where blockShapeRef: 3 in seeds was mapped incorrectly
      const [orphanedInstances] = await queryInterface.sequelize.query(
        `SELECT bi.id, bi.name, bs.name as block_shape_name 
         FROM block_instances bi
         LEFT JOIN block_shapes bs ON bi.block_shape_ref = bs.id
         WHERE bs.name IS NULL OR bs.name NOT IN ('user_type', 'service', 'availabiltiy_option', 'dwelling_adjustment');`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (orphanedInstances && orphanedInstances.length > 0) {
        console.log(`⚠️  Found ${orphanedInstances.length} block instances with unexpected blockShape references:`);
        orphanedInstances.forEach(instance => {
          console.log(`   - ${instance.name} (blockShape: ${instance.block_shape_name || 'NULL'})`);
        });
        console.log('   These will be left as-is. Manual review may be needed.');
      } else {
        console.log('✅ No orphaned block instances found');
      }
    }
    
    console.log('✅ Migration completed: Migrate Additional Services to Base Services');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back migration: Migrate Additional Services to Base Services');
    
    // Note: Rollback is complex because we don't know which block instances were originally
    // Additional Services vs Base Services. We'll log a warning.
    console.log('⚠️  Rollback not fully supported - cannot distinguish original Additional Service instances');
    console.log('   If rollback is needed, restore from database backup');
    
    // We could attempt to recreate the Additional Service blockShape, but we can't
    // reliably determine which block instances should be moved back
  },
};

