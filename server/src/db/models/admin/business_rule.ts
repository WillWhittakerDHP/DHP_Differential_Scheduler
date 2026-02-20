import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import type {
  ConditionalValidationRuleConfig,
  RequiredFieldsRuleConfig,
  RequiresAgentRuleConfig,
  RuleConfig,
  ValidationMessageRuleConfig,
} from '../../../../../shared/types/businessRulesTypes.js'
import { RULE_TYPE_VALUES } from '../../../../../shared/constants/businessRulesConstants.js'

/**
 * Business Rule Model
 * 
 * LEARNING: Stores admin-configurable validation rules as typed JSONB configs
 * WHY: Replaces hardcoded validation logic (isMultiFamily, requiresAgent) with database-driven rules
 * PATTERN: One-to-many relationship (block_instance → business_rules) with rule_type determining config schema
 * Type similarity UNIFY: rule config types imported from shared (Phase 1.2).
 */

/**
 * Rule type enumeration
 * LEARNING: Derived from shared RULE_TYPE_VALUES for single source of truth
 * WHY: No inline literals; aligns with client and constants consolidation audit
 */
export type RuleType = (typeof RULE_TYPE_VALUES)[keyof typeof RULE_TYPE_VALUES]

export type {
  ConditionalValidationRuleConfig,
  RequiredFieldsRuleConfig,
  RequiresAgentRuleConfig,
  RuleConfig,
  ValidationMessageRuleConfig,
}

/**
 * Business Rule Model Class
 * LEARNING: Sequelize model for business_rules table
 * WHY: Provides TypeScript types and database interaction
 * PATTERN: Model with typed JSONB field (ruleConfig type depends on ruleType)
 */
export class BusinessRule extends Model<
  InferAttributes<BusinessRule>,
  InferCreationAttributes<BusinessRule>
> {
  declare id: CreationOptional<string>;
  declare blockInstanceId: ForeignKey<string>;
  declare ruleType: RuleType;
  declare ruleConfig: RuleConfig;
  declare validationMessageAnnotationId: CreationOptional<string | null>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function BusinessRuleFactory(sequelize: Sequelize) {
  BusinessRule.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      blockInstanceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'block_instance_id',
        references: {
          model: 'block_instances',
          key: 'id',
        },
        comment: 'Block instance this rule applies to',
      },
      ruleType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'rule_type',
        comment: 'Rule type: required_fields, requires_agent, conditional_validation, validation_message',
      },
      ruleConfig: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: 'rule_config',
        comment: 'JSONB configuration for the rule (schema depends on rule_type)',
      },
      validationMessageAnnotationId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'validation_message_annotation_id',
        references: {
          model: 'annotation_instances',
          key: 'id',
        },
        comment: 'Optional link to annotation instance for validation message',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this business rule is active/enabled',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'business_rule',
      tableName: 'business_rules',
      freezeTableName: true,
      indexes: [
        {
          fields: ['block_instance_id'],
          name: 'idx_business_rules_block_instance_id',
        },
        {
          fields: ['rule_type'],
          name: 'idx_business_rules_rule_type',
        },
        {
          fields: ['active'],
          name: 'idx_business_rules_active',
        },
      ],
    }
  );

  return BusinessRule;
}
