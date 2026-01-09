/**
 * Migration: Create property_versions table
 * Date: 2026-01-06
 * Purpose: Create property_versions table as link table connecting addresses to versioned property details
 * 
 * LEARNING: PropertyVersion links one Address to potentially multiple PropertyDetails records
 * WHY: Name clearly indicates versioning purpose, prepares for future versioning logic in MLS API phase
 * PATTERN: UUID primary key, foreign key to addresses, minimal structure (versioning logic implemented later)
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('property_versions');
    
    if (!tableExists) {
      // Check if addresses table exists
      const addressesTableExists = await queryInterface.tableExists('addresses');
      if (!addressesTableExists) {
        throw new Error('Addresses table must exist before creating property_versions table');
      }

      // Create property_versions table
      await queryInterface.createTable('property_versions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        address_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'addresses',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          comment: 'Foreign key to addresses table',
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

      // Create indexes
      await queryInterface.addIndex('property_versions', ['address_id'], {
        name: 'idx_property_versions_address_id',
      });

      console.log('✅ Created property_versions table with indexes');
    } else {
      console.log('ℹ️  Table property_versions already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('property_versions');
    
    if (tableExists) {
      // Remove indexes
      try {
        await queryInterface.removeIndex('property_versions', 'idx_property_versions_address_id');
      } catch (e) {
        console.log('   ℹ️  Some indexes may not exist');
      }

      // Drop table
      await queryInterface.dropTable('property_versions');
      console.log('✅ Removed property_versions table');
    }
  }
};

