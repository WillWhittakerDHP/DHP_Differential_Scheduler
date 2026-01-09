/**
 * Migration: Create appointments table
 * Date: 2025-12-03
 * Purpose: Create appointments table for storing appointment/booking information
 * 
 * LEARNING: Appointments reference properties, users (client/agent), and block_instances
 * WHY: Central table for booking wizard data, supports both quote and booking modes
 * PATTERN: UUID primary key, JSONB for flexible arrays/objects, ENUM for status, multiple nullable foreign keys
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (!tableExists) {
      // Create status ENUM type
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE appointment_status_enum AS ENUM ('draft', 'quote', 'booked', 'completed', 'cancelled');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Check if referenced tables exist
      const propertiesTableExists = await queryInterface.tableExists('properties');
      const usersTableExists = await queryInterface.tableExists('users');
      const blockInstancesTableExists = await queryInterface.tableExists('block_instances');

      if (!propertiesTableExists) {
        throw new Error('Properties table must exist before creating appointments table');
      }

      // Create appointments table
      await queryInterface.createTable('appointments', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        property_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'properties',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        user_type_id: {
          type: Sequelize.UUID,
          allowNull: true,
          ...(blockInstancesTableExists ? {
            references: {
              model: 'block_instances',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          } : {}),
        },
        base_service_id: {
          type: Sequelize.UUID,
          allowNull: true,
          ...(blockInstancesTableExists ? {
            references: {
              model: 'block_instances',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          } : {}),
        },
        dwelling_adjustment_id: {
          type: Sequelize.UUID,
          allowNull: true,
          ...(blockInstancesTableExists ? {
            references: {
              model: 'block_instances',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          } : {}),
        },
        selected_availability_options: {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Array of block instance IDs for availability options',
        },
        selected_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        selected_date_range_end: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        selected_time_slots: {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Array of time slot data objects',
        },
        is_quote_mode: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        quote_pdf_url: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM('draft', 'quote', 'booked', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'draft',
        },
        client_id: {
          type: Sequelize.UUID,
          allowNull: true,
          ...(usersTableExists ? {
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          } : {}),
        },
        agent_id: {
          type: Sequelize.UUID,
          allowNull: true,
          ...(usersTableExists ? {
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          } : {}),
        },
        additional_contacts: {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Array of contact info objects',
        },
        property_details: {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Object with square footage, bedrooms, etc.',
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
      await queryInterface.addIndex('appointments', ['property_id'], {
        name: 'idx_appointments_property_id',
      });

      await queryInterface.addIndex('appointments', ['status'], {
        name: 'idx_appointments_status',
      });

      await queryInterface.addIndex('appointments', ['client_id'], {
        name: 'idx_appointments_client_id',
      });

      await queryInterface.addIndex('appointments', ['agent_id'], {
        name: 'idx_appointments_agent_id',
      });

      await queryInterface.addIndex('appointments', ['is_quote_mode'], {
        name: 'idx_appointments_is_quote_mode',
      });

      if (blockInstancesTableExists) {
        await queryInterface.addIndex('appointments', ['user_type_id'], {
          name: 'idx_appointments_user_type_id',
        });

        await queryInterface.addIndex('appointments', ['base_service_id'], {
          name: 'idx_appointments_base_service_id',
        });

        await queryInterface.addIndex('appointments', ['dwelling_adjustment_id'], {
          name: 'idx_appointments_dwelling_adjustment_id',
        });
      }

      console.log('✅ Created appointments table with indexes');
    } else {
      console.log('ℹ️  Table appointments already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('appointments');
    
    if (tableExists) {
      // Remove indexes
      try {
        const blockInstancesTableExists = await queryInterface.tableExists('block_instances');
        if (blockInstancesTableExists) {
          await queryInterface.removeIndex('appointments', 'idx_appointments_dwelling_adjustment_id');
          await queryInterface.removeIndex('appointments', 'idx_appointments_base_service_id');
          await queryInterface.removeIndex('appointments', 'idx_appointments_user_type_id');
        }
        await queryInterface.removeIndex('appointments', 'idx_appointments_is_quote_mode');
        await queryInterface.removeIndex('appointments', 'idx_appointments_agent_id');
        await queryInterface.removeIndex('appointments', 'idx_appointments_client_id');
        await queryInterface.removeIndex('appointments', 'idx_appointments_status');
        await queryInterface.removeIndex('appointments', 'idx_appointments_property_id');
      } catch (e) {
        console.log('   ℹ️  Some indexes may not exist');
      }

      // Drop table
      await queryInterface.dropTable('appointments');
      console.log('✅ Removed appointments table');

      // Drop ENUM type
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS appointment_status_enum;');
      console.log('✅ Removed appointment_status_enum type');
    }
  }
};

