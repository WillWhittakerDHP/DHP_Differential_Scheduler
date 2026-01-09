/**
 * Migration: Create addresses table
 * Date: 2026-01-06
 * Purpose: Create addresses table for storing stable address information from client input
 * 
 * LEARNING: Addresses are normalized separately from property details for reuse and stability
 * WHY: Address information is relatively stable and comes from client input, separate from API/manual property details
 * PATTERN: UUID primary key, required fields for address components, indexes for lookup
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('addresses');
    
    if (!tableExists) {
      // Create addresses table
      await queryInterface.createTable('addresses', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: 'Street address',
        },
        unit: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Unit/apartment number',
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        zip_code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Create indexes for common lookups
      await queryInterface.addIndex('addresses', ['city'], {
        name: 'idx_addresses_city',
      });

      await queryInterface.addIndex('addresses', ['state'], {
        name: 'idx_addresses_state',
      });

      await queryInterface.addIndex('addresses', ['zip_code'], {
        name: 'idx_addresses_zip_code',
      });

      // Composite index for address lookup (address + city + state + zip_code)
      await queryInterface.addIndex('addresses', ['address', 'city', 'state', 'zip_code'], {
        name: 'idx_addresses_full_address',
      });

      console.log('✅ Created addresses table with indexes');
    } else {
      console.log('ℹ️  Table addresses already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('addresses');
    
    if (tableExists) {
      // Remove indexes
      try {
        await queryInterface.removeIndex('addresses', 'idx_addresses_full_address');
        await queryInterface.removeIndex('addresses', 'idx_addresses_zip_code');
        await queryInterface.removeIndex('addresses', 'idx_addresses_state');
        await queryInterface.removeIndex('addresses', 'idx_addresses_city');
      } catch (e) {
        console.log('   ℹ️  Some indexes may not exist');
      }

      // Drop table
      await queryInterface.dropTable('addresses');
      console.log('✅ Removed addresses table');
    }
  }
};

