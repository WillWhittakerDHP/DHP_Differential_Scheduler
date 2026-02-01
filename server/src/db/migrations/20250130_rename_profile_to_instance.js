/**
 * Migration: Rename Profile to Instance Terminology
 * Purpose: Rename block_profiles/part_profiles tables to block_instances/part_instances
 * Date: 2025-01-30
 * Session: 9.2
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const blockProfilesExists = await queryInterface.tableExists('block_profiles');
    const partProfilesExists = await queryInterface.tableExists('part_profiles');
    
    if (blockProfilesExists) {
      await queryInterface.renameTable('block_profiles', 'block_instances');
      console.log('✅ Renamed block_profiles table to block_instances');
    } else {
      console.log('ℹ️  Table block_profiles does not exist, skipping rename');
    }
    
    if (partProfilesExists) {
      await queryInterface.renameTable('part_profiles', 'part_instances');
      console.log('✅ Renamed part_profiles table to part_instances');
    } else {
      console.log('ℹ️  Table part_profiles does not exist, skipping rename');
    }

    // 3. Update foreign key constraints in active_blocks table
    const activeBlocksExists = await queryInterface.tableExists('active_blocks');
    if (activeBlocksExists) {
      try {
        // Remove old foreign key constraints if they exist
        await queryInterface.removeConstraint('active_blocks', 'active_blocks_parent_id_fkey').catch(() => {});
        await queryInterface.removeConstraint('active_blocks', 'active_blocks_child_id_fkey').catch(() => {});
        
        // Add new foreign key constraints pointing to block_instances
        await queryInterface.addConstraint('active_blocks', {
          fields: ['parent_id'],
          type: 'foreign key',
          name: 'active_blocks_parent_id_fkey',
          references: {
            table: 'block_instances',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        });
        
        await queryInterface.addConstraint('active_blocks', {
          fields: ['child_id'],
          type: 'foreign key',
          name: 'active_blocks_child_id_fkey',
          references: {
            table: 'block_instances',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        });
        
        console.log('✅ Updated foreign key constraints in active_blocks table');
      } catch (error) {
        console.log('ℹ️  Error updating active_blocks foreign keys (may already be updated):', error.message);
      }
    }

    // 4. Update foreign key constraints in active_parts table
    const activePartsExists = await queryInterface.tableExists('active_parts');
    if (activePartsExists) {
      try {
        // Remove old foreign key constraints if they exist
        await queryInterface.removeConstraint('active_parts', 'active_parts_parent_id_fkey').catch(() => {});
        await queryInterface.removeConstraint('active_parts', 'active_parts_child_id_fkey').catch(() => {});
        
        // Add new foreign key constraints pointing to block_instances and part_instances
        await queryInterface.addConstraint('active_parts', {
          fields: ['parent_id'],
          type: 'foreign key',
          name: 'active_parts_parent_id_fkey',
          references: {
            table: 'block_instances',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        });
        
        await queryInterface.addConstraint('active_parts', {
          fields: ['child_id'],
          type: 'foreign key',
          name: 'active_parts_child_id_fkey',
          references: {
            table: 'part_instances',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        });
        
        console.log('✅ Updated foreign key constraints in active_parts table');
      } catch (error) {
        console.log('ℹ️  Error updating active_parts foreign keys (may already be updated):', error.message);
      }
    }

    // 5. Update foreign key constraint in block_instances table (block_shape_ref)
    const blockInstancesExists = await queryInterface.tableExists('block_instances');
    if (blockInstancesExists) {
      try {
        // Remove old constraint if it exists
        await queryInterface.removeConstraint('block_instances', 'block_profiles_block_shape_ref_fkey').catch(() => {});
        await queryInterface.removeConstraint('block_instances', 'block_instances_block_shape_ref_fkey').catch(() => {});
        
        await queryInterface.addConstraint('block_instances', {
          fields: ['block_shape_ref'],
          type: 'foreign key',
          name: 'block_instances_block_shape_ref_fkey',
          references: {
            table: 'block_shapes',
            field: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        });
        
        console.log('✅ Updated foreign key constraint for block_shape_ref in block_instances table');
      } catch (error) {
        console.log('ℹ️  Error updating block_instances block_shape_ref foreign key (may already be updated):', error.message);
      }
    }

    // 6. Update foreign key constraint in part_instances table (part_shape_ref)
    const partInstancesExists = await queryInterface.tableExists('part_instances');
    if (partInstancesExists) {
      try {
        // Remove old constraint if it exists
        await queryInterface.removeConstraint('part_instances', 'part_profiles_part_shape_ref_fkey').catch(() => {});
        await queryInterface.removeConstraint('part_instances', 'part_instances_part_shape_ref_fkey').catch(() => {});
        
        await queryInterface.addConstraint('part_instances', {
          fields: ['part_shape_ref'],
          type: 'foreign key',
          name: 'part_instances_part_shape_ref_fkey',
          references: {
            table: 'part_shapes',
            field: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        });
        
        console.log('✅ Updated foreign key constraint for part_shape_ref in part_instances table');
      } catch (error) {
        console.log('ℹ️  Error updating part_instances part_shape_ref foreign key (may already be updated):', error.message);
      }
    }

    console.log('✅ Migration completed: Renamed Profile to Instance tables');
  },

  async down(queryInterface, Sequelize) {
    const blockInstancesExists = await queryInterface.tableExists('block_instances');
    const partInstancesExists = await queryInterface.tableExists('part_instances');
    
    if (blockInstancesExists) {
      await queryInterface.renameTable('block_instances', 'block_profiles');
      console.log('✅ Reverted: Renamed block_instances table back to block_profiles');
    }
    
    if (partInstancesExists) {
      await queryInterface.renameTable('part_instances', 'part_profiles');
      console.log('✅ Reverted: Renamed part_instances table back to part_profiles');
    }

    // Revert foreign key constraints in active_blocks
    const activeBlocksExists = await queryInterface.tableExists('active_blocks');
    if (activeBlocksExists) {
      try {
        await queryInterface.removeConstraint('active_blocks', 'active_blocks_parent_id_fkey').catch(() => {});
        await queryInterface.removeConstraint('active_blocks', 'active_blocks_child_id_fkey').catch(() => {});
        
        await queryInterface.addConstraint('active_blocks', {
          fields: ['parent_id'],
          type: 'foreign key',
          name: 'active_blocks_parent_id_fkey',
          references: {
            table: 'block_profiles',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        });
        
        await queryInterface.addConstraint('active_blocks', {
          fields: ['child_id'],
          type: 'foreign key',
          name: 'active_blocks_child_id_fkey',
          references: {
            table: 'block_profiles',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        });
      } catch (error) {
        console.log('ℹ️  Error reverting active_blocks foreign keys:', error.message);
      }
    }

    // Revert foreign key constraints in active_parts
    const activePartsExists = await queryInterface.tableExists('active_parts');
    if (activePartsExists) {
      try {
        await queryInterface.removeConstraint('active_parts', 'active_parts_parent_id_fkey').catch(() => {});
        await queryInterface.removeConstraint('active_parts', 'active_parts_child_id_fkey').catch(() => {});
        
        await queryInterface.addConstraint('active_parts', {
          fields: ['parent_id'],
          type: 'foreign key',
          name: 'active_parts_parent_id_fkey',
          references: {
            table: 'block_profiles',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        });
        
        await queryInterface.addConstraint('active_parts', {
          fields: ['child_id'],
          type: 'foreign key',
          name: 'active_parts_child_id_fkey',
          references: {
            table: 'part_profiles',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        });
      } catch (error) {
        console.log('ℹ️  Error reverting active_parts foreign keys:', error.message);
      }
    }

    // Revert foreign key constraints in block_profiles
    const blockProfilesExists = await queryInterface.tableExists('block_profiles');
    if (blockProfilesExists) {
      try {
        await queryInterface.removeConstraint('block_profiles', 'block_instances_block_shape_ref_fkey').catch(() => {});
        await queryInterface.addConstraint('block_profiles', {
          fields: ['block_shape_ref'],
          type: 'foreign key',
          name: 'block_profiles_block_shape_ref_fkey',
          references: {
            table: 'block_shapes',
            field: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        });
      } catch (error) {
        console.log('ℹ️  Error reverting block_profiles foreign key:', error.message);
      }
    }

    // Revert foreign key constraints in part_profiles
    const partProfilesExists = await queryInterface.tableExists('part_profiles');
    if (partProfilesExists) {
      try {
        await queryInterface.removeConstraint('part_profiles', 'part_instances_part_shape_ref_fkey').catch(() => {});
        await queryInterface.addConstraint('part_profiles', {
          fields: ['part_shape_ref'],
          type: 'foreign key',
          name: 'part_profiles_part_shape_ref_fkey',
          references: {
            table: 'part_shapes',
            field: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        });
      } catch (error) {
        console.log('ℹ️  Error reverting part_profiles foreign key:', error.message);
      }
    }

    console.log('✅ Migration reverted: Renamed Instance tables back to Profile');
  },
};

