/**
 * Migration: Create business_rules table
 * Date: 2026-01-31
 * Purpose: Create business_rules table for storing admin-configurable validation rules
 * 
 * LEARNING: Business rules define validation behavior per block instance (services, dwelling adjustments)
 * WHY: Replaces hardcoded validation logic (isMultiFamily, requiresAgent) with database-driven rules
 * PATTERN: One-to-many relationship (block_instance → business_rules) with typed JSONB configs
 * 
 * Rule Types:
 * - required_fields: Additional required form fields based on block selection
 * - requires_agent: Service requires agent/client contact information
 * - conditional_validation: Field validation depends on other field values
 * - validation_message: Custom validation messages for fields/blocks
 */

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_rules');
    
    if (!tableExists) {
      // Create business_rules table
      await queryInterface.createTable('business_rules', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
          allowNull: false,
        },
        block_instance_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'block_instances',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Block instance this rule applies to (service, dwelling adjustment, etc.)',
        },
        rule_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'Rule type: required_fields, requires_agent, conditional_validation, validation_message',
        },
        rule_config: {
          type: Sequelize.JSONB,
          allowNull: false,
          comment: 'JSONB configuration for the rule (schema depends on rule_type)',
        },
        validation_message_annotation_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'annotation_instances',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Optional link to annotation instance for validation message',
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Whether this business rule is active/enabled',
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

      // Create indexes for fast queries
      await queryInterface.addIndex('business_rules', ['block_instance_id'], {
        name: 'idx_business_rules_block_instance_id',
      });

      await queryInterface.addIndex('business_rules', ['rule_type'], {
        name: 'idx_business_rules_rule_type',
      });

      await queryInterface.addIndex('business_rules', ['active'], {
        name: 'idx_business_rules_active',
      });

      console.log('✅ Created business_rules table with indexes');
    } else {
      console.log('ℹ️  Table business_rules already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_rules');
    
    if (tableExists) {
      // Remove indexes
      try {
        await queryInterface.removeIndex('business_rules', 'idx_business_rules_block_instance_id');
        await queryInterface.removeIndex('business_rules', 'idx_business_rules_rule_type');
        await queryInterface.removeIndex('business_rules', 'idx_business_rules_active');
      } catch (e) {
        console.log('   ℹ️  Some indexes may not exist');
      }

      // Drop table
      await queryInterface.dropTable('business_rules');
      console.log('✅ Removed business_rules table');
    }
  }
};
