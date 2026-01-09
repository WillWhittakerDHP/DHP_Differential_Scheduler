/**
 * Migration: Fix User Type Block Instances blockShapeRef
 * Date: 2026-01-09
 * Purpose: Update user type block instances (Buyer, Agent, Owner, Inspector) to point to the correct "User" block shape
 *          This fixes the issue where user type cards don't render because block instances don't reference the User block shape
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting user type block instances fix...');

    // Find the User block shape by constituable: false (name may have changed)
    // LEARNING: Identify by property, not by name, since names can change
    const [userBlockShapes] = await queryInterface.sequelize.query(`
      SELECT id, name, constituable, active
      FROM block_shapes
      WHERE constituable = false
        AND active = true
      ORDER BY order_index
      LIMIT 1
    `);

    if (!userBlockShapes || userBlockShapes.length === 0) {
      console.log('⚠️  User block shape not found. Skipping migration.');
      return;
    }

    const userBlockShapeId = userBlockShapes[0].id;
    console.log(`✅ Found User block shape: ${userBlockShapes[0].name} (id: ${userBlockShapeId})`);

    // Find ALL block instances that reference this block shape via blockShapeRef
    // LEARNING: Identify by blockShapeRef, not by name or properties
    // WHY: Block shape names and instance names can change, but blockShapeRef is the source of truth
    const [userTypeInstances] = await queryInterface.sequelize.query(`
      SELECT id, name, block_shape_ref, active
      FROM block_instances
      WHERE block_shape_ref = :userBlockShapeId
        AND active = true
    `, {
      replacements: { userBlockShapeId },
      type: Sequelize.QueryTypes.SELECT
    });
    
    console.log(`📋 Found ${userTypeInstances.length} block instances referencing User block shape:`);
    userTypeInstances.forEach(inst => {
      console.log(`   - ${inst.name} (id: ${inst.id})`);
    });

    // If no instances reference this block shape, create the user type instances from seed data
    // LEARNING: Only create if none exist - let existing instances remain regardless of name
    // WHY: Block instances are identified by blockShapeRef, not by name
    const userTypeSeedData = [
      { name: 'Buyer', description: "I need an inspection to help me understand a property that I am trying to buy", icon: 'tabler-shopping-cart', baseSqFt: 200, visible: true },
      { name: 'Agent', description: "I am a real estate agent helping a buyer with their inspection needs", icon: 'tabler-users', baseSqFt: 200, visible: true },
      { name: 'Owner', description: "I already own a property but need to understand it better", icon: 'tabler-home', baseSqFt: 200, visible: true },
      { name: 'Inspector', description: "This is me!", icon: 'tabler-clipboard-check', baseSqFt: 200, visible: false }
    ];

    const instancesToCreate = userTypeInstances.length === 0 ? userTypeSeedData : [];

    // Create missing instances
    if (instancesToCreate.length > 0) {
      console.log(`📝 Creating ${instancesToCreate.length} missing user type block instances:`);
      
      // Get max order_index to append new instances
      const [maxOrderResult] = await queryInterface.sequelize.query(`
        SELECT COALESCE(MAX(order_index), -1) as max_order_index
        FROM block_instances
      `, { type: Sequelize.QueryTypes.SELECT });
      
      const maxOrderIndex = maxOrderResult?.max_order_index ?? -1;
      
      for (let i = 0; i < instancesToCreate.length; i++) {
        const seed = instancesToCreate[i];
        const orderIndex = maxOrderIndex + 1 + i;
        
        try {
          await queryInterface.sequelize.query(`
            INSERT INTO block_instances (id, name, block_shape_ref, icon, base_sq_ft, active, composite, differential, order_index, created_at, updated_at)
            VALUES (gen_random_uuid(), :name, :userBlockShapeId, :icon, :baseSqFt, true, false, false, :orderIndex, NOW(), NOW())
          `, {
            replacements: {
              name: seed.name,
              userBlockShapeId,
              icon: seed.icon,
              baseSqFt: seed.baseSqFt,
              orderIndex
            }
          });
          
          console.log(`   ✅ Created: ${seed.name}`);
        } catch (error) {
          console.error(`   ❌ Failed to create ${seed.name}:`, error.message);
          throw error;
        }
      }
    }

    // Verify final state - check all instances referencing this block shape
    const [finalInstances] = await queryInterface.sequelize.query(`
      SELECT id, name, block_shape_ref, active
      FROM block_instances
      WHERE block_shape_ref = :userBlockShapeId
        AND active = true
    `, {
      replacements: { userBlockShapeId },
      type: Sequelize.QueryTypes.SELECT
    });

    console.log(`✅ Final state: ${finalInstances.length} block instances reference User block shape:`);
    finalInstances.forEach(inst => {
      console.log(`   - ${inst.name} (id: ${inst.id}, blockShapeRef: ${inst.block_shape_ref})`);
    });
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  Down migration not implemented. User type block instances will remain pointing to User block shape.');
    // Down migration would require knowing the original blockShapeRef values, which we don't have
  }
};

