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
 * DependentInstanceOption Model
 * 
 * Represents dependent instance option relationships between block instances.
 * Dependent instance option relationships define which block instances are valid as 
 * dependent options within the booking wizard for a specific parent block instance.
 * 
 * LEARNING: Dependent instance option relationships enable instance-specific nested selection
 * WHY: Block instances need to define which other block instances are valid as dependent options
 *      This is instance-specific (many-to-many) rather than shape-level
 *      Works for any block shape: services, property types, availability options, etc.
 * PATTERN: Through table for many-to-many dependent option relationships between block instances
 * 
 * NOTE: Renamed from AdditionalServiceOption to DependentInstanceOption for clearer, 
 *       generic domain terminology (2026-01-09)
 */
export class DependentInstanceOption extends Model<
  InferAttributes<DependentInstanceOption>,
  InferCreationAttributes<DependentInstanceOption>
> {
  declare id: CreationOptional<string>;
  declare kind: CreationOptional<string>;
  declare parent_kind: CreationOptional<string>;
  declare child_kind: CreationOptional<string>;  
  declare parent_id: ForeignKey<string>;
  declare child_id: ForeignKey<string>;
  declare disabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function DependentInstanceOptionFactory(sequelize: Sequelize) {
  DependentInstanceOption.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "dependentInstanceOptions";
        }
      },
      parent_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "blockInstance";
        }
      },
      child_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "blockInstance";
        }
      },  
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      child_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
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
      modelName: 'dependent_instance_option',
      tableName: 'dependent_instance_options',
      indexes: [
        {
          unique: true,
          fields: ["parent_id", "child_id"]
        }
      ],
      freezeTableName: true,
    }
  );

  return DependentInstanceOption;
}

