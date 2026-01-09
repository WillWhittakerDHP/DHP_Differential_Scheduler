/**
 * Migration: Rename service_components to instance_components
 * 
 * Purpose: Generalize the component pattern terminology.
 * The component pattern applies to any composable block instance, not just "services".
 * This rename prepares for property type components and other future uses.
 * 
 * Changes:
 *   - service_components → instance_components
 *   - Updates foreign key constraint names accordingly
 * 
 * Date: 2026-01-07
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting service_components → instance_components rename migration...');

    const serviceComponentsExists = await queryInterface.tableExists('service_components');
    if (serviceComponentsExists) {
      // Drop foreign key constraints first
      try {
        await queryInterface.removeConstraint('service_components', 'service_components_parent_id_fkey');
        await queryInterface.removeConstraint('service_components', 'service_components_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing service_components constraints (may not exist):', error.message);
      }
      
      // Rename table
      await queryInterface.renameTable('service_components', 'instance_components');
      console.log('✅ Renamed service_components table to instance_components');
      
      // Re-add foreign key constraints with new names
      await queryInterface.addConstraint('instance_components', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'instance_components_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('instance_components', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'instance_components_child_id_fkey',
      });
      console.log('✅ Updated foreign key constraints in instance_components table');
    } else {
      console.log('ℹ️  Table service_components does not exist, skipping rename');
    }

    console.log('✅ service_components → instance_components rename migration completed!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting instance_components → service_components rename migration...');

    const instanceComponentsExists = await queryInterface.tableExists('instance_components');
    if (instanceComponentsExists) {
      try {
        await queryInterface.removeConstraint('instance_components', 'instance_components_parent_id_fkey');
        await queryInterface.removeConstraint('instance_components', 'instance_components_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing instance_components constraints:', error.message);
      }
      
      await queryInterface.renameTable('instance_components', 'service_components');
      console.log('✅ Renamed instance_components table back to service_components');
      
      await queryInterface.addConstraint('service_components', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'service_components_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('service_components', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'service_components_child_id_fkey',
      });
    }

    console.log('✅ instance_components → service_components rename migration reverted!');
  },
};

