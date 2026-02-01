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
 * ValidComposition Model
 * 
 * Represents valid composition relationships between shapes (block shapes or part shapes).
 * Composition relationships are lateral composition relationships (same shape, e.g., service_shape → service_shape).
 * 
 * LEARNING: Shape-level composition defines which shapes can compose other shapes
 * WHY: Shapes need to define which other shapes of the same type can be composed into them
 * PATTERN: Through table for many-to-many composition relationships between shapes
 * COMPARISON: ValidComposition is shape-level (which shapes can compose), ActiveComposition is instance-level (which instances are composed)
 */
export class ValidComposition extends Model<
  InferAttributes<ValidComposition>,
  InferCreationAttributes<ValidComposition>
> {
  declare id: CreationOptional<string>;
  declare parent_shape_id: ForeignKey<string>;
  declare child_shape_id: ForeignKey<string>;
  declare shape_kind: string; // e.g., 'blockShape', 'partShape'
  declare order_index: number;
  declare disabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

/**
 * ValidComposition Factory Function
 * 
 * Creates and initializes the ValidComposition model.
 * Note: Foreign key references are dynamic based on shape_kind,
 * so we use generic references that will be validated at runtime.
 * 
 * LEARNING: Factory pattern for Sequelize model initialization
 * WHY: Models need to be initialized with sequelize instance
 * PATTERN: Factory function returns initialized model class
 */
export function ValidCompositionFactory(sequelize: Sequelize) {
  ValidComposition.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      parent_shape_id: {
        type: DataTypes.UUID,
        allowNull: false,
        // Actual table reference will be validated at runtime via entity registry
        // For now, we use a generic reference that will be validated by application logic
      },
      child_shape_id: {
        type: DataTypes.UUID,
        allowNull: false,
        // Actual table reference will be validated at runtime via entity registry
      },
      shape_kind: {
        type: DataTypes.STRING,
        allowNull: false,
        // Validates against entity registry (e.g., 'blockShape', 'partShape', etc.)
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'valid_composition',
      tableName: 'valid_compositions',
      indexes: [
        {
          unique: true,
          fields: ['parent_shape_id', 'child_shape_id'],
          name: 'unique_parent_child_shape',
        },
        {
          fields: ['parent_shape_id'],
          name: 'idx_parent_shape',
        },
        {
          fields: ['child_shape_id'],
          name: 'idx_child_shape',
        },
        {
          fields: ['shape_kind'],
          name: 'idx_shape_kind',
        },
      ],
      freezeTableName: true,
    }
  );

  return ValidComposition;
}

