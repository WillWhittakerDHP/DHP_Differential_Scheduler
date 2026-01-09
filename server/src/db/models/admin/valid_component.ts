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
 * ValidComponent Model
 * 
 * Represents valid component relationships between block shapes.
 * Component relationships define which block shapes can be used as components of other block shapes.
 * 
 * LEARNING: Component relationships enable option component selection
 * WHY: Block shapes need to define which other block shapes are valid as components
 * PATTERN: Through table for many-to-many component relationships between block shapes
 */
export class ValidComponent extends Model<
  InferAttributes<ValidComponent>,
  InferCreationAttributes<ValidComponent>
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

export function ValidComponentFactory(sequelize: Sequelize) {
  ValidComponent.init(
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
          return "validComponents";
        }
      },
      parent_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "blockShape";
        }
      },
      child_kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "blockShape";
        }
      },  
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
          key: 'id',
        },
      },
      child_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
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
      modelName: 'valid_component',
      tableName: 'valid_components',
      indexes: [
        {
          unique: true,
          fields: ["parent_id", "child_id"]
        }
      ],
      freezeTableName: true,
    }
  );

  return ValidComponent;
}

