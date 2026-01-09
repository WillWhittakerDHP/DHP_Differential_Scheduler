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
 * ValidCascade Model
 * 
 * Represents valid cascade relationships between block shapes.
 * Cascade relationships are vertical hierarchy relationships (different shapes, e.g., user_shape → service).
 * 
 * LEARNING: Cascade relationships enable hierarchical filtering
 * WHY: Block shapes need to define which other block shapes can cascade from them
 * PATTERN: Through table for many-to-many cascade relationships between block shapes
 */
export class ValidCascade extends Model<
  InferAttributes<ValidCascade>,
  InferCreationAttributes<ValidCascade>
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

export function ValidCascadeFactory(sequelize: Sequelize) {
  ValidCascade.init(
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
          return "validCascades";
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
      modelName: 'valid_cascade',
      tableName: 'valid_cascades',
      indexes: [
        {
          unique: true,
          fields: ["parent_id", "child_id"]
        }
      ],
      freezeTableName: true,
    }
  );

  return ValidCascade;
}

