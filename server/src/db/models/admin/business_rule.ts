import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

/**
 * Business Rule Model
 * 
 * LEARNING: Stores admin-configurable validation rules as typed JSONB configs
 * WHY: Replaces hardcoded validation logic (isMultiFamily, requiresAgent) with database-driven rules
 * PATTERN: One-to-many relationship (block_instance → business_rules) with rule_type determining config schema
 * 
 * TypeScript types provide compile-time safety for JSONB rule_config based on rule_type
 */

/**
 * Rule type enumeration
 * LEARNING: String enum for rule_type column
 * WHY: Flexible for future rule types, easy to query, TypeScript type safety
 * PATTERN: Union type for string literal types
 */
export type RuleType = 
  | 'required_fields'        // Additional required fields based on block selection
  | 'requires_agent'         // Service requires agent/client contact information
  | 'conditional_validation' // Field validation depends on other field values
  | 'validation_message';    // Custom validation messages for fields/blocks

/**
 * Required Fields Rule Config
 * LEARNING: Defines additional required fields when block is selected
 * WHY: Multi-family properties require numberOfUnits, some services require specific fields
 * PATTERN: Array of field names with optional condition
 * 
 * Example: { fields: ["numberOfUnits"], condition: "isMultiFamily" }
 */
export interface RequiredFieldsRuleConfig {
  fields: string[];           // Array of field names that become required
  condition?: string;         // Optional condition (e.g., "isMultiFamily", "hasDeck")
}

/**
 * Requires Agent Rule Config
 * LEARNING: Indicates service requires agent/client contact information
 * WHY: Some services need agent details (e.g., Buyers Inspection), others don't
 * PATTERN: Simple boolean flag
 * 
 * Example: { requiresAgent: true }
 */
export interface RequiresAgentRuleConfig {
  requiresAgent: boolean;
}

/**
 * Conditional Validation Rule Config
 * LEARNING: Field validation depends on other field values
 * WHY: Complex validation logic (e.g., field X required when field Y equals value Z)
 * PATTERN: Dependent field, condition type, condition value
 * 
 * Example: { field: "deckSquareFootage", dependsOn: "hasDeck", condition: "equals", value: true }
 */
export interface ConditionalValidationRuleConfig {
  field: string;              // Field to validate
  dependsOn: string;          // Field that determines validation
  condition: string;          // Condition type (e.g., "equals", "contains", "greaterThan")
  value: unknown;             // Value to compare against
}

/**
 * Validation Message Rule Config
 * LEARNING: Custom validation messages for fields/blocks
 * WHY: Admin-configurable error messages instead of hardcoded strings
 * PATTERN: Field name and message type
 * 
 * Example: { field: "propertyTypeBlock", messageType: "required" }
 */
export interface ValidationMessageRuleConfig {
  field: string;              // Field this message applies to
  messageType: 'required' | 'invalid' | 'custom'; // Type of validation message
}

/**
 * Rule Config Union Type
 * LEARNING: TypeScript union type for all possible rule configs
 * WHY: Type safety for JSONB field based on rule_type
 * PATTERN: Discriminated union based on rule_type
 */
export type RuleConfig = 
  | RequiredFieldsRuleConfig 
  | RequiresAgentRuleConfig 
  | ConditionalValidationRuleConfig
  | ValidationMessageRuleConfig;

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
