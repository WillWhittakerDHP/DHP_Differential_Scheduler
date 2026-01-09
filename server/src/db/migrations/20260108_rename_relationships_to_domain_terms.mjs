/**
 * Migration: Rename Relationship Tables to Domain-Specific Terms
 * 
 * Purpose: Rename relationship tables to use clearer domain terminology:
 *   - active_cascades → booking_cascades (Booking Cascade)
 *   - active_components → service_components (Service Components)
 *   - valid_independent_components → additional_service_options (Additional Service Options)
 * 
 * Date: 2026-01-08
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting relationship tables rename migration...');

    // 1. Rename active_cascades → booking_cascades
    const activeCascadesExists = await queryInterface.tableExists('active_cascades');
    if (activeCascadesExists) {
      // Drop foreign key constraints first
      try {
        await queryInterface.removeConstraint('active_cascades', 'active_cascades_parent_id_fkey');
        await queryInterface.removeConstraint('active_cascades', 'active_cascades_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing active_cascades constraints (may not exist):', error.message);
      }
      
      // Rename table
      await queryInterface.renameTable('active_cascades', 'booking_cascades');
      console.log('✅ Renamed active_cascades table to booking_cascades');
      
      // Re-add foreign key constraints with new names
      await queryInterface.addConstraint('booking_cascades', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'booking_cascades_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('booking_cascades', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'booking_cascades_child_id_fkey',
      });
      console.log('✅ Updated foreign key constraints in booking_cascades table');
    } else {
      console.log('ℹ️  Table active_cascades does not exist, skipping rename');
    }

    // 2. Rename active_components → service_components
    const activeComponentsExists = await queryInterface.tableExists('active_components');
    if (activeComponentsExists) {
      // Drop foreign key constraints first
      try {
        await queryInterface.removeConstraint('active_components', 'active_components_parent_id_fkey');
        await queryInterface.removeConstraint('active_components', 'active_components_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing active_components constraints (may not exist):', error.message);
      }
      
      // Rename table
      await queryInterface.renameTable('active_components', 'service_components');
      console.log('✅ Renamed active_components table to service_components');
      
      // Re-add foreign key constraints with new names
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
      console.log('✅ Updated foreign key constraints in service_components table');
    } else {
      console.log('ℹ️  Table active_components does not exist, skipping rename');
    }

    // 3. Rename valid_independent_components → additional_service_options
    const validIndependentComponentsExists = await queryInterface.tableExists('valid_independent_components');
    if (validIndependentComponentsExists) {
      // Drop foreign key constraints first
      try {
        await queryInterface.removeConstraint('valid_independent_components', 'valid_independent_components_parent_id_fkey');
        await queryInterface.removeConstraint('valid_independent_components', 'valid_independent_components_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing valid_independent_components constraints (may not exist):', error.message);
      }
      
      // Rename table
      await queryInterface.renameTable('valid_independent_components', 'additional_service_options');
      console.log('✅ Renamed valid_independent_components table to additional_service_options');
      
      // Re-add foreign key constraints with new names
      await queryInterface.addConstraint('additional_service_options', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'additional_service_options_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('additional_service_options', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'additional_service_options_child_id_fkey',
      });
      console.log('✅ Updated foreign key constraints in additional_service_options table');
    } else {
      console.log('ℹ️  Table valid_independent_components does not exist, skipping rename');
    }

    console.log('✅ Relationship tables rename migration completed!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting relationship tables rename migration...');

    // 3. Rename additional_service_options → valid_independent_components
    const additionalServiceOptionsExists = await queryInterface.tableExists('additional_service_options');
    if (additionalServiceOptionsExists) {
      try {
        await queryInterface.removeConstraint('additional_service_options', 'additional_service_options_parent_id_fkey');
        await queryInterface.removeConstraint('additional_service_options', 'additional_service_options_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing additional_service_options constraints:', error.message);
      }
      
      await queryInterface.renameTable('additional_service_options', 'valid_independent_components');
      console.log('✅ Renamed additional_service_options table back to valid_independent_components');
      
      await queryInterface.addConstraint('valid_independent_components', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_independent_components_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('valid_independent_components', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'valid_independent_components_child_id_fkey',
      });
    }

    // 2. Rename service_components → active_components
    const serviceComponentsExists = await queryInterface.tableExists('service_components');
    if (serviceComponentsExists) {
      try {
        await queryInterface.removeConstraint('service_components', 'service_components_parent_id_fkey');
        await queryInterface.removeConstraint('service_components', 'service_components_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing service_components constraints:', error.message);
      }
      
      await queryInterface.renameTable('service_components', 'active_components');
      console.log('✅ Renamed service_components table back to active_components');
      
      await queryInterface.addConstraint('active_components', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_components_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('active_components', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_components_child_id_fkey',
      });
    }

    // 1. Rename booking_cascades → active_cascades
    const bookingCascadesExists = await queryInterface.tableExists('booking_cascades');
    if (bookingCascadesExists) {
      try {
        await queryInterface.removeConstraint('booking_cascades', 'booking_cascades_parent_id_fkey');
        await queryInterface.removeConstraint('booking_cascades', 'booking_cascades_child_id_fkey');
      } catch (error) {
        console.log('ℹ️  Error removing booking_cascades constraints:', error.message);
      }
      
      await queryInterface.renameTable('booking_cascades', 'active_cascades');
      console.log('✅ Renamed booking_cascades table back to active_cascades');
      
      await queryInterface.addConstraint('active_cascades', {
        fields: ['parent_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_cascades_parent_id_fkey',
      });
      
      await queryInterface.addConstraint('active_cascades', {
        fields: ['child_id'],
        type: 'foreign key',
        references: {
          table: 'block_instances',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'active_cascades_child_id_fkey',
      });
    }

    console.log('✅ Relationship tables rename migration reverted!');
  },
};

